//custom made funcional component for the TUI editor

import { useRef, useState, useEffect } from 'react';
import TuiImageEditor from './editor/src';
import './editor/src/editor.css';

type ThemeConfig = {
    'common.bi.image'?: string;
    'common.bisize.width'?: string;
    'common.bisize.height'?: string;
    'common.backgroundImage'?: string;
    'common.backgroundColor'?: string;
    'common.border'?: string;
    'header.backgroundImage'?: string;
    'header.backgroundColor'?: string;
    'header.border'?: string;
    'loadButton.backgroundColor'?: string;
    'loadButton.border'?: string;
    'loadButton.color'?: string;
    'loadButton.fontFamily'?: string;
    'loadButton.fontSize'?: string;
    'downloadButton.backgroundColor'?: string;
    'downloadButton.border'?: string;
    'downloadButton.color'?: string;
    'downloadButton.fontFamily'?: string;
    'downloadButton.fontSize'?: string;
    'menu.normalIcon.path'?: string;
    'menu.normalIcon.name'?: string;
    'menu.activeIcon.path'?: string;
    'menu.activeIcon.name'?: string;
    'menu.iconSize.width'?: string;
    'menu.iconSize.height'?: string;
    'submenu.backgroundColor'?: string;
    'submenu.partition.color'?: string;
    'submenu.normalIcon.path'?: string;
    'submenu.normalIcon.name'?: string;
    'submenu.activeIcon.path'?: string;
    'submenu.activeIcon.name'?: string;
    'submenu.iconSize.width'?: string;
    'submenu.iconSize.height'?: string;
    'submenu.normalLabel.color'?: string;
    'submenu.normalLabel.fontWeight'?: string;
    'submenu.activeLabel.color'?: string;
    'submenu.activeLabel.fontWeight'?: string;
    'checkbox.border'?: string;
    'checkbox.backgroundColor'?: string;
    'range.pointer.color'?: string;
    'range.bar.color'?: string;
    'range.subbar.color'?: string;
    'range.value.color'?: string;
    'range.value.fontWeight'?: string;
    'range.value.fontSize'?: string;
    'range.value.border'?: string;
    'range.value.backgroundColor'?: string;
    'range.title.color'?: string;
    'range.title.fontWeight'?: string;
    'colorpicker.button.border'?: string;
    'colorpicker.title.color'?: string;
};

type ImageEditorType = {
    includeUI: {
        loadImage?: {
            path: string;
            name: string;
        };
        theme?: ThemeConfig;
        menu?: string[];
        initMenu?: string;
        uiSize?: {
            width: string;
            height: string;
        };
        menuBarPosition?: string;
        usageStatistics?: boolean;
    },
    cssMaxWidth?: number;
    cssMaxHeight?: number;
    usageStatistics?: boolean;
    selectionStyle?: {
        cornerStyle?: string;
        cornerSize?: number;
        cornerColor?: string;
        cornerStrokeColor?: string;
        transparentCorners?: boolean;
        lineWidth?: number;
        borderColor?: string;
        rotatingPointOffset?: number;
    };
}

export default function ImageEditor (props: ImageEditorType) {
    const rootEl = useRef(null);
    const [imageEditorInstance, setImageEditorInstace] = useState<TuiImageEditor | null>(null);

    useEffect(() => {
        const initialize = () => {
            if(rootEl.current) setImageEditorInstace(new TuiImageEditor(rootEl.current, { ...props }));
        }

        initialize();
        bindEventHandlers(props) ;

        return () => {
            unbindEventHandlers();
            if(imageEditorInstance) (imageEditorInstance as TuiImageEditor).destroy();
            if(imageEditorInstance) setImageEditorInstace(null);
        }
    }, [rootEl.current]);

    const bindEventHandlers = (props: ImageEditorType, prevProps?: ImageEditorType) => {
        Object.keys(props)
            .filter(isEventHandlerKeys)
            .forEach((key) => {
            const eventName = key[2].toLowerCase() + key.slice(3);
            // For <ImageEditor onFocus={condition ? onFocus1 : onFocus2} />

            //@ts-ignore
            if (prevProps && prevProps[key] !== props[key]) {
                //@ts-ignore
                (imageEditorInstance as TuiImageEditor)?.off(eventName);
            }
            //@ts-ignore
            (imageEditorInstance as TuiImageEditor).on(eventName, props[key]);
        });
    };

    const unbindEventHandlers = () => {
        Object.keys(props)
            .filter(isEventHandlerKeys)
            .forEach((key) => {
            const eventName = key[2].toLowerCase() + key.slice(3);
            //@ts-ignore
            (imageEditorInstance as TuiImageEditor)?.off(eventName);
        });
    }

    const isEventHandlerKeys = (key: string) => {
        return /on[A-Z][a-zA-Z]+/.test(key);
    }

    return <div ref={rootEl} />;
}
