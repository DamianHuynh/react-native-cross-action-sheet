/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "CrossActionSheet.h"

#import <React/RCTBridge.h>
#import <React/RCTConvert.h>
#import <React/RCTLog.h>
#import <React/RCTUIManager.h>
#import <React/RCTUtils.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import "RNCrossActionSheetSpec.h"
#endif

@interface CrossActionSheet () <UIActionSheetDelegate>
@property (nonatomic, strong) NSMutableArray<UIAlertController *> *alertControllers;
@end

@implementation CrossActionSheet
{
    // Use NSMapTable, as UIAlertViews do not implement <NSCopying>
    // which is required for NSDictionary keys
    NSMapTable *_callbacks;
}

- (instancetype)init
{
  self = [super init];
  if (self) {
    _alertControllers = [NSMutableArray new];
  }
  return self;
}

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

RCT_EXPORT_MODULE()

@synthesize bridge = _bridge;

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

- (void)presentViewController:(UIViewController *)alertController
       onParentViewController:(UIViewController *)parentViewController
                anchorViewTag:(NSNumber *)anchorViewTag
{
    alertController.modalPresentationStyle = UIModalPresentationPopover;
    UIView *sourceView = parentViewController.view;
    
    if (anchorViewTag) {
        sourceView = [self.bridge.uiManager viewForReactTag:anchorViewTag];
    } else {
        alertController.popoverPresentationController.permittedArrowDirections = 0;
    }
    alertController.popoverPresentationController.sourceView = sourceView;
    alertController.popoverPresentationController.sourceRect = sourceView.bounds;
    [parentViewController presentViewController:alertController animated:YES completion:nil];
}

RCT_EXPORT_METHOD(showActionSheetWithOptions:(NSDictionary *)options
                  callback:(RCTResponseSenderBlock)callback)
{
    if (RCTRunningInAppExtension()) {
        RCTLogError(@"Unable to show action sheet from app extension");
        return;
    }
    
    if (!_callbacks) {
        _callbacks = [NSMapTable strongToStrongObjectsMapTable];
    }
    
    NSString *title = [RCTConvert NSString:options[@"title"]];
    NSString *message = [RCTConvert NSString:options[@"message"]];
    NSArray<NSString *> *buttons = [RCTConvert NSStringArray:options[@"options"]];
    NSInteger cancelButtonIndex = options[@"cancelButtonIndex"] ? [RCTConvert NSInteger:options[@"cancelButtonIndex"]] : -1;
    NSArray<NSNumber *> *destructiveButtonIndices;
    if ([options[@"destructiveButtonIndex"] isKindOfClass:[NSArray class]]) {
        destructiveButtonIndices = [RCTConvert NSArray:options[@"destructiveButtonIndex"]];
    } else {
        NSNumber *destructiveButtonIndex = options[@"destructiveButtonIndex"] ? [RCTConvert NSNumber:options[@"destructiveButtonIndex"]] : @-1;
        destructiveButtonIndices = @[destructiveButtonIndex];
    }
    
    UIViewController *controller = RCTPresentedViewController();
    
    if (controller == nil) {
        RCTLogError(@"Tried to display action sheet but there is no application window. options: %@", options);
        return;
    }
    
    /*
     * The `anchor` option takes a view to set as the anchor for the share
     * popup to point to, on iPads running iOS 8. If it is not passed, it
     * defaults to centering the share popup on screen without any arrows.
     */
    NSNumber *anchorViewTag = [RCTConvert NSNumber:options[@"anchor"]];
    
    UIAlertController *alertController =
    [UIAlertController alertControllerWithTitle:title
                                        message:message
                                 preferredStyle:UIAlertControllerStyleActionSheet];
    
    NSInteger index = 0;
    __block bool callbackInvoked = false;
    for (NSString *option in buttons) {
        UIAlertActionStyle style = UIAlertActionStyleDefault;
        if ([destructiveButtonIndices containsObject:@(index)]) {
            style = UIAlertActionStyleDestructive;
        } else if (index == cancelButtonIndex) {
            style = UIAlertActionStyleCancel;
        }
        
        NSInteger localIndex = index;
        [alertController addAction:[UIAlertAction actionWithTitle:option
                                                            style:style
                                                          handler:^(__unused UIAlertAction *action){
            if (!callbackInvoked) {
                                                                        callbackInvoked = true;
                                                                        [self->_alertControllers removeObject:alertController];
                                                                        callback(@[ @(localIndex) ]);
                                                                      }
            
        }]];
        
        index++;
    }
    
    alertController.view.tintColor = [RCTConvert UIColor:options[@"tintColor"]];
    [_alertControllers addObject:alertController];
    [self presentViewController:alertController onParentViewController:controller anchorViewTag:anchorViewTag];
}


RCT_EXPORT_METHOD(dismissActionSheet)
{
    if (_alertControllers.count == 0) {
        RCTLogWarn(@"Unable to dismiss action sheet");
        NSLog(@"%@==================", _alertControllers);
    }
    
    id _alertController = [_alertControllers lastObject];
    [_alertController dismissViewControllerAnimated:YES completion:nil];
    [_alertControllers removeLastObject];
}

// Don't compile this code when we build for the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
(const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeCrossActionSheetSpecJSI>(params);
}
#endif

@end
