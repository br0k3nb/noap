import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { DRAG_DROP_PASTE } from '@lexical/rich-text';
import { isMimeType, mediaFileReader } from '@lexical/utils';
import { COMMAND_PRIORITY_LOW } from 'lexical';

import Compressor from 'compressorjs';
import imageCompression from 'browser-image-compression';

import { INSERT_IMAGE_COMMAND } from '../ImagesPlugin';
import { toastAlert } from "../../../../../../components/Alert";

const ACCEPTABLE_IMAGE_TYPES = [
  'image/',
  'image/heic',
  'image/heif',
  'image/gif',
  'image/webp',
];

export default function DragDropPaste(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      DRAG_DROP_PASTE,
      (files) => {
          (async () => {
              const filesResult = await mediaFileReader(
                files,
                [ACCEPTABLE_IMAGE_TYPES].flatMap((x) => x),
              );

              for (const { file } of filesResult) {
                if (isMimeType(file, ACCEPTABLE_IMAGE_TYPES)) {
                  if(file.size <= 5006613 && file.type.startsWith("image")) {
                    new Compressor(file, {
                      quality: 0.3,
                      success: async (compressedResult) => {
                        const options = {
                          maxSizeMB: 0.2,
                          maxWidthOrHeight: 1920,
                          useWebWorker: true,
                        }

                        try {
                            const compressedFile = await imageCompression(compressedResult as File, options);
                            const reader = new FileReader();

                            reader.onload = async () => {
                              if (typeof reader.result === "string") {
                                editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                                  altText: file.name,
                                  src: reader.result,
                                });
                              }

                              return "";
                            };
                            reader.readAsDataURL(compressedFile);
                        } catch (error: any) {
                          toastAlert({ icon: "error", title: error, timer: 3000 });
                        }
                      },
                    });
                  } else if(file && !file.type.startsWith("image")) {
                    toastAlert({ icon: "error", title: `Only images are supported!`, timer: 3000 });
                  } else {
                    toastAlert({ icon: "error", title: `Image too large!`, timer: 3000 });
                  }
                }
              }
          })();
          return true;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor]);

  return null;
}
