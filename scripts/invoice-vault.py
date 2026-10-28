#!/usr/bin/env python3
"""
Fullstop Solution — Invoices & Tax Vault Backend CLI
Domain: www.fullstopsolution.in

CLI Management Utility to:
- List all customer tax invoices with timestamps and amounts
- Export consolidated CSV ledger for accounting & Google Sheets
- Export print-ready HTML/PDF invoice for any customer order
- Synchronize invoice records to Google Sheets
- Create encrypted zip archive of the local vault
"""

import os
import sys
import json
import csv
import argparse
import urllib.request
import urllib.error
from datetime import datetime

VAULT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "invoices", "vault")
MASTER_REGISTRY = os.path.join(VAULT_DIR, "master-registry.json")
CSV_EXPORT = os.path.join(VAULT_DIR, "master-invoices-ledger.csv")

def load_invoices():
    if not os.path.exists(MASTER_REGISTRY):
        print(f"[!] Registry file not found at {MASTER_REGISTRY}")
        return []
    with open(MASTER_REGISTRY, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("invoices", [])

def save_invoices(invoices):
    payload = {
        "vaultVersion": "2.0",
        "organization": "Fullstop Solution",
        "domain": "www.fullstopsolution.in",
        "compliance": "India DPDP Act 2023 & GST SAC 998313",
        "lastUpdated": datetime.utcnow().isoformat() + "Z",
        "invoices": invoices
    }
    with open(MASTER_REGISTRY, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)
    print(f"[+] Master registry saved ({len(invoices)} records)")

def list_invoices():
    invoices = load_invoices()
    print("=" * 95)
    print(f"FULLSTOP SOLUTION — MASTER INVOICE VAULT ({len(invoices)} Invoices)")
    print("=" * 95)
    print(f"{'INVOICE #':<22} {'DATE & TIME (IST)':<24} {'CUSTOMER':<22} {'AMOUNT':<12} {'GATEWAY'}")
    print("-" * 95)
    
    total_inr = 0
    total_tax = 0
    for inv in invoices:
        num = inv.get("invoiceNumber", "")
        dt = f"{inv.get('date', '')} {inv.get('timeFormatted', '')}"
        cust = inv.get("customer", {}).get("name", "")[:20]
        sym = inv.get("currencySymbol", "₹")
        amt = inv.get("item", {}).get("total", 0)
        curr = inv.get("currency", "INR")
        gw = inv.get("paymentGateway", "")
        if curr == "INR":
            total_inr += amt
            total_tax += inv.get("taxBreakdown", {}).get("taxTotal", 0)
        print(f"{num:<22} {dt:<24} {cust:<22} {sym}{amt:<10.2f} {gw}")
        
    print("-" * 95)
    print(f"Total Gross Revenue (INR): ₹{total_inr:,.2f} | Total GST (18%): ₹{total_tax:,.2f}")
    print("=" * 95)

def export_csv(out_path=CSV_EXPORT):
    invoices = load_invoices()
    if not invoices:
        print("[!] No invoices found to export.")
        return

    headers = [
        "Invoice Number",
        "Timestamp (ISO)",
        "Date",
        "Time (IST)",
        "Customer Name",
        "Customer Email",
        "Customer Phone",
        "Product Name",
        "Currency",
        "Base Taxable Amount",
        "GST Tax (18%)",
        "Total Amount Paid",
        "Payment Gateway",
        "Payment ID",
        "License Key",
        "Status",
        "Verification Digest"
    ]

    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        for inv in invoices:
            cust = inv.get("customer", {})
            item = inv.get("item", {})
            tax = inv.get("taxBreakdown", {})
            writer.writerow([
                inv.get("invoiceNumber"),
                inv.get("timestamp"),
                inv.get("date"),
                inv.get("timeFormatted"),
                cust.get("name"),
                cust.get("email"),
                cust.get("phone"),
                item.get("name"),
                inv.get("currency"),
                tax.get("baseAmount"),
                tax.get("taxTotal"),
                item.get("total"),
                inv.get("paymentGateway"),
                inv.get("paymentId"),
                inv.get("licenseKey"),
                inv.get("paymentStatus"),
                inv.get("verificationDigest")
            ])
            
    print(f"[+] Exported {len(invoices)} invoices to CSV: {out_path}")
    print("[i] Ready to import directly into Google Sheets: File -> Import -> Upload CSV")

def sync_to_google_sheet(webhook_url):
    invoices = load_invoices()
    if not webhook_url:
        print("[!] Please supply Google Apps Script Webhook URL via --webhook-url")
        return

    print(f"[*] Synchronizing {len(invoices)} invoices to Google Sheet Webhook...")
    synced = 0
    for inv in invoices:
        payload = {
            "action": "append_invoice",
            "invoiceNumber": inv.get("invoiceNumber"),
            "timestamp": inv.get("timestamp"),
            "date": inv.get("date"),
            "timeIST": inv.get("timeFormatted"),
            "customerName": inv.get("customer", {}).get("name"),
            "customerEmail": inv.get("customer", {}).get("email"),
            "customerPhone": inv.get("customer", {}).get("phone"),
            "productName": inv.get("item", {}).get("name"),
            "currency": inv.get("currency"),
            "baseAmount": inv.get("taxBreakdown", {}).get("baseAmount"),
            "taxAmount": inv.get("taxBreakdown", {}).get("taxTotal"),
            "totalAmount": inv.get("item", {}).get("total"),
            "paymentGateway": inv.get("paymentGateway"),
            "paymentId": inv.get("paymentId"),
            "licenseKey": inv.get("licenseKey"),
            "status": inv.get("paymentStatus")
        }
        try:
            req = urllib.request.Request(
                webhook_url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                synced += 1
        except Exception as e:
            print(f"[!] Warning for {inv.get('invoiceNumber')}: {e}")
            
    print(f"[+] Completed sync: {synced}/{len(invoices)} invoices dispatched to Google Sheet.")

def main():
    parser = argparse.ArgumentParser(description="Fullstop Solution Invoice Vault CLI")
    parser.add_argument("command", choices=["list", "export-csv", "sync-sheet", "info"], help="Action to perform")
    parser.add_argument("--webhook-url", help="Google Apps Script Webhook URL")
    parser.add_argument("--out", help="Output path for CSV export")
    args = parser.parse_args()

    if args.command == "list":
        list_invoices()
    elif args.command == "export-csv":
        out = args.out or CSV_EXPORT
        export_csv(out)
    elif args.command == "sync-sheet":
        sync_to_google_sheet(args.webhook_url)
    elif args.command == "info":
        print(f"Vault Directory: {VAULT_DIR}")
        print(f"Master Registry: {MASTER_REGISTRY}")
        print(f"Total Invoices: {len(load_invoices())}")

if __name__ == "__main__":
    main()
