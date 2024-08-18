import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { FaRegSave } from "react-icons/fa";

import ImageEditor from ".";
import Modal from "../../../../../../components/Modal";
import ConfirmationModal from "../../../../../../components/ConfirmationModal";
import TuiImageEditor from './editor/src';
import type { InsertImagePayload } from "../ImagesPlugin";

type Props = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  image: string;
  onImageEdit: (payload: InsertImagePayload) => void;
}

export default function EditImageModal({ open, setOpen, image, onImageEdit }: Props) {
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [imageEditorInstance, setImageEditorInstance] = useState<TuiImageEditor | null>(null);
  
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.keyCode === 27) setOpenConfirmationModal(true);
  };

  useEffect(() => {
    if(open) {
      const imageWrapper = document.getElementsByClassName("tui-image-editor-canvas-container");
      if(imageWrapper.length) {
        const el = imageWrapper[0];
        el.className = `${el.className} xxs:!ml-[40px]`;

        if((innerWidth <= 639 && imageEditorInstance)) {
          //@ts-ignore
          imageEditorInstance.ui.resize._els.widthRange._value = 200;
          //@ts-ignore
          imageEditorInstance.ui.resize._els.heightRange._value = 200;
        }
      }
    }
  }, [open, imageEditorInstance])


  return (
    <Modal
      open={open}
      setOpen={setOpen}
      title="Edit image"
      options={{
        modalWrapperClassName: 'w-full !h-full !max-h-none !max-w-none rounded-none xxs:!w-full !px-0 overflow-y-hidden',
        titleWrapperClassName: "!px-6",
        customKeyboardPressHandler: (e) => handleKeyPress(e),
        customTopActionButton: (
          <EditButton 
            saveFn={onImageEdit}
            setOpen={setOpen}
            imageEditorInstance={imageEditorInstance}
          />
        )
      }}
    >
      <ConfirmationModal
        mainText="Are you sure you want to leave the editor ?"
        open={openConfirmationModal}
        setOpen={setOpenConfirmationModal}
        options={{
          actionButtonText: "Close",
          cancelButtonText: "Keep editing",
          subText: "All unsaved changes will be lost!",
          subTextClassName: "px-6",
          actionButtonsWrapperClassName: "border border-transparent border-t-[#4b5563] pt-4",
          modalWrapperClassName: "!pb-[15px]"
        }}
        actionButtonFn={() => {
          setOpenConfirmationModal(false);
          setOpen(false);
        }}
      />
      {open && (
        <ImageEditor
          editorInstance={imageEditorInstance}
          setEditorInstance={setImageEditorInstance}
          includeUI={{
            loadImage: { path: image, name: 'image' },
            menuBarPosition: 'right',
            theme: { 'common.bisize.width': '0px', 'common.bisize.height': '0px' }
          }}
          usageStatistics={false}
        />
      )}
    </Modal>
  )
}

type EditButtonType = {
  saveFn: (payload: InsertImagePayload) => void;
  setOpen: Dispatch<SetStateAction<boolean>>;
  imageEditorInstance: TuiImageEditor | null;
} 

type eventHandlerType = {
  download: () => string;
}

function EditButton ({ saveFn, setOpen, imageEditorInstance } : EditButtonType) {
  const handleClick = () => {    
    if(imageEditorInstance && (imageEditorInstance.ui?.eventHandler as eventHandlerType).download) {
      const src = (imageEditorInstance.ui?.eventHandler as eventHandlerType).download();

      saveFn({ src, altText: '' });
      setOpen(false);
    }
  }

  return (
    <div 
      className='mx-2 mt-[1px]' 
      onClick={() => handleClick()}
    >
      <button 
        id="tui-image-editor-download-btn" 
        className="transition-all duration-300 ease-in-out hover:tracking-wide bg-[#ffffff] border border-gray-500 text-gray-900 dark:text-gray-200 px-3 rounded-full bg-inherit hover:bg-green-700 py-1"
      >
        <div className="flex flex-row space-x-2 text-[13.5px] uppercase">
          <p>Save image</p>
          <FaRegSave size={19} />
        </div>
      </button>
    </div>
  )
}