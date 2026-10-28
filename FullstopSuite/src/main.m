#import <Cocoa/Cocoa.h>
#import <WebKit/WebKit.h>

@interface AppDelegate : NSObject <NSApplicationDelegate, WKNavigationDelegate, WKUIDelegate>
@property (strong, nonatomic) NSWindow *window;
@property (strong, nonatomic) WKWebView *webView;
@end

@implementation AppDelegate

- (void)applicationDidFinishLaunching:(NSNotification *)aNotification {
    [NSApp setActivationPolicy:NSApplicationActivationPolicyRegular];
    [self setupMainMenu];
    [self setupWindow];
    [self loadWorkstation];
}

- (void)setupMainMenu {
    NSMenu *menubar = [[NSMenu alloc] init];
    
    // 1. App Menu
    NSMenuItem *appMenuItem = [[NSMenuItem alloc] init];
    NSMenu *appMenu = [[NSMenu alloc] initWithTitle:@"Fullstop Suite"];
    [appMenu addItemWithTitle:@"About Fullstop Suite" action:@selector(showAboutDialog) keyEquivalent:@""];
    [appMenu addItemWithTitle:@"Check for Updates..." action:@selector(checkForUpdates) keyEquivalent:@"u"];
    [appMenu addItem:[NSMenuItem separatorItem]];
    [appMenu addItemWithTitle:@"Preferences..." action:nil keyEquivalent:@","];
    [appMenu addItem:[NSMenuItem separatorItem]];
    [appMenu addItemWithTitle:@"Hide Fullstop Suite" action:@selector(hide:) keyEquivalent:@"h"];
    NSMenuItem *hideOthers = [appMenu addItemWithTitle:@"Hide Others" action:@selector(hideOtherApplications:) keyEquivalent:@"h"];
    [hideOthers setKeyEquivalentModifierMask:(NSEventModifierFlagOption | NSEventModifierFlagCommand)];
    [appMenu addItemWithTitle:@"Show All" action:@selector(unhideAllApplications:) keyEquivalent:@""];
    [appMenu addItem:[NSMenuItem separatorItem]];
    [appMenu addItemWithTitle:@"Quit Fullstop Suite" action:@selector(terminate:) keyEquivalent:@"q"];
    [appMenuItem setSubmenu:appMenu];
    [menubar addItem:appMenuItem];
    
    // 2. Edit Menu (Standard Cocoa Edit menu for native copy/paste/cut/undo)
    NSMenuItem *editMenuItem = [[NSMenuItem alloc] init];
    NSMenu *editMenu = [[NSMenu alloc] initWithTitle:@"Edit"];
    [editMenu addItemWithTitle:@"Undo" action:@selector(undo:) keyEquivalent:@"z"];
    [editMenu addItemWithTitle:@"Redo" action:@selector(redo:) keyEquivalent:@"Z"];
    [editMenu addItem:[NSMenuItem separatorItem]];
    [editMenu addItemWithTitle:@"Cut" action:@selector(cut:) keyEquivalent:@"x"];
    [editMenu addItemWithTitle:@"Copy" action:@selector(copy:) keyEquivalent:@"c"];
    [editMenu addItemWithTitle:@"Paste" action:@selector(paste:) keyEquivalent:@"v"];
    [editMenu addItemWithTitle:@"Select All" action:@selector(selectAll:) keyEquivalent:@"a"];
    [editMenuItem setSubmenu:editMenu];
    [menubar addItem:editMenuItem];
    
    // 3. Tools Menu
    NSMenuItem *toolsMenuItem = [[NSMenuItem alloc] init];
    NSMenu *toolsMenu = [[NSMenu alloc] initWithTitle:@"Tools"];
    
    NSArray *toolList = @[
        @{@"title": @"Password Generator", @"key": @"password", @"shortcut": @"1"},
        @{@"title": @"Hash Calculator", @"key": @"hash", @"shortcut": @"2"},
        @{@"title": @"JSON Studio", @"key": @"json", @"shortcut": @"3"},
        @{@"title": @"Base64 Studio", @"key": @"base64", @"shortcut": @"4"},
        @{@"title": @"QR Code Studio", @"key": @"qr", @"shortcut": @"5"},
        @{@"title": @"GST & VAT Calculator", @"key": @"gst", @"shortcut": @"6"},
        @{@"title": @"Invoice Studio", @"key": @"invoice", @"shortcut": @"7"},
        @{@"title": @"UUID Generator", @"key": @"uuid", @"shortcut": @"8"},
        @{@"title": @"UTM Campaign Builder", @"key": @"utm", @"shortcut": @"9"},
        @{@"title": @"SEO Keyword Analyzer", @"key": @"keyword", @"shortcut": @"0"},
        @{@"title": @"Meta Tag & SERP Studio", @"key": @"meta", @"shortcut": @"m"},
    ];
    
    for (NSDictionary *t in toolList) {
        NSMenuItem *item = [[NSMenuItem alloc] initWithTitle:t[@"title"] action:@selector(selectToolFromMenu:) keyEquivalent:t[@"shortcut"]];
        item.representedObject = t[@"key"];
        item.target = self;
        [toolsMenu addItem:item];
    }
    
    [toolsMenu addItem:[NSMenuItem separatorItem]];
    NSMenuItem *sentinelItem = [[NSMenuItem alloc] initWithTitle:@"MacSentinel Security Auditor" action:@selector(selectToolFromMenu:) keyEquivalent:@"s"];
    sentinelItem.representedObject = @"macsentinel";
    sentinelItem.target = self;
    [toolsMenu addItem:sentinelItem];
    
    [toolsMenuItem setSubmenu:toolsMenu];
    [menubar addItem:toolsMenuItem];
    
    // 4. View Menu
    NSMenuItem *viewMenuItem = [[NSMenuItem alloc] init];
    NSMenu *viewMenu = [[NSMenu alloc] initWithTitle:@"View"];
    [viewMenu addItemWithTitle:@"Reload Workspace" action:@selector(reloadWorkspace) keyEquivalent:@"r"];
    [viewMenu addItem:[NSMenuItem separatorItem]];
    [viewMenu addItemWithTitle:@"Toggle Full Screen" action:@selector(toggleFullScreen:) keyEquivalent:@"f"];
    [viewMenuItem setSubmenu:viewMenu];
    [menubar addItem:viewMenuItem];
    
    // 5. Window Menu
    NSMenuItem *windowMenuItem = [[NSMenuItem alloc] init];
    NSMenu *windowMenu = [[NSMenu alloc] initWithTitle:@"Window"];
    [windowMenu addItemWithTitle:@"Minimize" action:@selector(performMiniaturize:) keyEquivalent:@"m"];
    [windowMenu addItemWithTitle:@"Zoom" action:@selector(performZoom:) keyEquivalent:@""];
    [windowMenu addItem:[NSMenuItem separatorItem]];
    [windowMenu addItemWithTitle:@"Bring All to Front" action:@selector(arrangeInFront:) keyEquivalent:@""];
    [windowMenuItem setSubmenu:windowMenu];
    [menubar addItem:windowMenuItem];
    
    // 6. Help Menu
    NSMenuItem *helpMenuItem = [[NSMenuItem alloc] init];
    NSMenu *helpMenu = [[NSMenu alloc] initWithTitle:@"Help"];
    [helpMenu addItemWithTitle:@"Fullstop Suite Documentation" action:@selector(openHelpDocs) keyEquivalent:@"?"];
    [helpMenu addItemWithTitle:@"Security & Cryptographic Signatures" action:@selector(openSecurityDocs) keyEquivalent:@""];
    [helpMenuItem setSubmenu:helpMenu];
    [menubar addItem:helpMenuItem];
    
    [NSApp setMainMenu:menubar];
}

- (void)setupWindow {
    NSRect screenRect = [[NSScreen mainScreen] visibleFrame];
    CGFloat width = 1280.0;
    CGFloat height = 820.0;
    CGFloat x = screenRect.origin.x + (screenRect.size.width - width) / 2.0;
    CGFloat y = screenRect.origin.y + (screenRect.size.height - height) / 2.0;
    NSRect windowRect = NSMakeRect(x, y, width, height);
    
    NSWindowStyleMask styleMask = NSWindowStyleMaskTitled |
                                  NSWindowStyleMaskClosable |
                                  NSWindowStyleMaskMiniaturizable |
                                  NSWindowStyleMaskResizable |
                                  NSWindowStyleMaskFullSizeContentView;
    
    self.window = [[NSWindow alloc] initWithContentRect:windowRect
                                              styleMask:styleMask
                                                backing:NSBackingStoreBuffered
                                                  defer:NO];
    self.window.title = @"Fullstop Suite — Offline Desktop Workstation";
    if (@available(macOS 11.0, *)) {
        self.window.subtitle = @"v1.0.0 Enterprise • 100% Client-Side & Private";
    }
    self.window.minSize = NSMakeSize(960.0, 600.0);
    self.window.appearance = [NSAppearance appearanceNamed:NSAppearanceNameDarkAqua];
    self.window.titlebarAppearsTransparent = YES;
    self.window.titleVisibility = NSWindowTitleVisible;
    self.window.collectionBehavior = NSWindowCollectionBehaviorFullScreenPrimary;
    
    WKWebViewConfiguration *config = [[WKWebViewConfiguration alloc] init];
    WKPreferences *prefs = [[WKPreferences alloc] init];
    [prefs setValue:@YES forKey:@"developerExtrasEnabled"];
    config.preferences = prefs;
    
    self.webView = [[WKWebView alloc] initWithFrame:windowRect configuration:config];
    self.webView.navigationDelegate = self;
    self.webView.UIDelegate = self;
    self.webView.autoresizingMask = NSViewWidthSizable | NSViewHeightSizable;
    
    self.window.contentView = self.webView;
    [self.window makeKeyAndOrderFront:nil];
    [NSApp activateIgnoringOtherApps:YES];
}

- (void)loadWorkstation {
    // 1. Try inside App Bundle: Contents/Resources/app/index.html
    NSURL *bundleResourceURL = [[NSBundle mainBundle] resourceURL];
    NSURL *appDir = [bundleResourceURL URLByAppendingPathComponent:@"app"];
    NSURL *indexURL = [appDir URLByAppendingPathComponent:@"index.html"];
    
    if ([[NSFileManager defaultManager] fileExistsAtPath:[indexURL path]]) {
        [self.webView loadFileURL:indexURL allowingReadAccessToURL:appDir];
        return;
    }
    
    // 2. Fallback relative to current executable location (for development / testing)
    NSString *execDir = [[[NSBundle mainBundle] bundlePath] stringByDeletingLastPathComponent];
    NSString *fallbackAppPath = [execDir stringByAppendingPathComponent:@"FullstopSuite/app"];
    NSURL *fallbackDir = [NSURL fileURLWithPath:fallbackAppPath];
    NSURL *fallbackIndex = [fallbackDir URLByAppendingPathComponent:@"index.html"];
    
    if ([[NSFileManager defaultManager] fileExistsAtPath:[fallbackIndex path]]) {
        [self.webView loadFileURL:fallbackIndex allowingReadAccessToURL:fallbackDir];
        return;
    }
    
    // 3. Fallback inline error if bundle assets are not found
    NSString *errorHTML = @"<html><body style='background:#0a0d14;color:#f8fafc;font-family:sans-serif;padding:3rem;text-align:center;'>"
                          @"<h2>Fullstop Suite</h2><p style='color:#ef4444;'>Resource bundle missing. Please reinstall the application.</p></body></html>";
    [self.webView loadHTMLString:errorHTML baseURL:nil];
}

- (void)selectToolFromMenu:(NSMenuItem *)sender {
    NSString *toolKey = (NSString *)sender.representedObject;
    if (toolKey && self.webView) {
        NSString *js = [NSString stringWithFormat:@"if (window.DesktopApp) { DesktopApp.selectTool('%@'); }", toolKey];
        [self.webView evaluateJavaScript:js completionHandler:nil];
    }
}

- (void)reloadWorkspace {
    [self.webView reload];
}

- (void)showAboutDialog {
    NSAlert *alert = [[NSAlert alloc] init];
    alert.messageText = @"Fullstop Suite Desktop";
    alert.informativeText = @"Version 1.0.0 (Build 2026.10)\n\n"
                            @"Zero-Knowledge, 100% Client-Side Professional Workstation.\n"
                            @"All tools execute strictly in local memory with zero external tracking.\n\n"
                            @"Cryptographically verified with SHA-256 and Fullstop Solution Security Root.\n\n"
                            @"© 2026 Fullstop Solution (www.fullstopsolution.in)";
    alert.alertStyle = NSAlertStyleInformational;
    [alert runModal];
}

- (void)checkForUpdates {
    [[NSWorkspace sharedWorkspace] openURL:[NSURL URLWithString:@"https://www.fullstopsolution.in/#downloads"]];
}

- (void)openHelpDocs {
    [[NSWorkspace sharedWorkspace] openURL:[NSURL URLWithString:@"https://www.fullstopsolution.in/security.html"]];
}

- (void)openSecurityDocs {
    [[NSWorkspace sharedWorkspace] openURL:[NSURL URLWithString:@"https://www.fullstopsolution.in/downloads/SHA256SUMS.txt"]];
}

#pragma mark - WKNavigationDelegate

- (void)webView:(WKWebView *)webView decidePolicyForNavigationAction:(WKNavigationAction *)navigationAction decisionHandler:(void (^)(WKNavigationActionPolicy))decisionHandler {
    NSURL *url = navigationAction.request.URL;
    NSString *scheme = [[url scheme] lowercaseString];
    
    // External links (HTTP / HTTPS / Mailto) open in system browser / default apps
    if ([scheme isEqualToString:@"http"] || [scheme isEqualToString:@"https"] || [scheme isEqualToString:@"mailto"]) {
        [[NSWorkspace sharedWorkspace] openURL:url];
        decisionHandler(WKNavigationActionPolicyCancel);
        return;
    }
    
    decisionHandler(WKNavigationActionPolicyAllow);
}

- (BOOL)applicationShouldTerminateAfterLastWindowClosed:(NSApplication *)sender {
    return YES;
}

@end

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        NSApplication *app = [NSApplication sharedApplication];
        AppDelegate *delegate = [[AppDelegate alloc] init];
        app.delegate = delegate;
        [app run];
    }
    return 0;
}
