import { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { BsXLg } from 'react-icons/bs';

import "./Modal.css";

function PortalImpl({
  onClose,
  children,
  title,
  closeOnClickOutside,
}: {
  children: ReactNode;
  closeOnClickOutside: boolean;
  onClose: () => void;
  title: string;
}) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (modalRef.current !== null) modalRef.current.focus() }, []);

  useEffect(() => {
    let modalOverlayElement: HTMLElement | null = null;

    const handler = (event: KeyboardEvent) => {
      if (event.keyCode === 27) onClose();
    };

    const clickOutsideHandler = (event: MouseEvent) => {
      const target = event.target;
      if (modalRef.current !== null && !modalRef.current.contains(target as Node) && closeOnClickOutside) onClose();
    };

    const modelElement = modalRef.current;

    if (modelElement !== null) {
      modalOverlayElement = modelElement.parentElement;
      if (modalOverlayElement !== null) modalOverlayElement.addEventListener('click', clickOutsideHandler);
    }

    window.addEventListener("keydown", handler);

    return () => {
      window.removeEventListener("keydown", handler);
      if (modalOverlayElement !== null) modalOverlayElement?.removeEventListener("click", clickOutsideHandler);
    };
  }, [closeOnClickOutside, onClose]);

  return (
    <div 
      className="Modal__overlay" 
      role="dialog"
    >
      <div 
        tabIndex={-1} 
        ref={modalRef}
        className="Modal__modal bg-[#f8f8f8] dark:bg-[#0f1011] border !border-gray-700 dark:!border-[#404040] !shadow-none xxs:!max-w-xs px-0" 
      >
        <div className="flex justify-between pb-4 border border-transparent border-b-gray-600 dark:border-b-[#404040]">
          <h2 className="text-gray-900 dark:text-gray-300 text-[15px] uppercase tracking-widest py-1 px-6">{title}</h2>
          <button
            className="Modal__closeButton hover:bg-[#e1e1e1] dark:hover:bg-[#323232] transition-all duration-300 ease-in-out"
            aria-label="Close modal"
            type="button"
            onClick={onClose}
          >
            <BsXLg size={18} className='text-gray-900 dark:text-gray-300' />
          </button>
        </div>
        <div className="Modal__content !px-6">{children}</div>
      </div>
    </div>
  );
}

export default function Modal({
  onClose,
  children,
  title,
  closeOnClickOutside = false,
}: {
  children: ReactNode;
  closeOnClickOutside?: boolean;
  onClose: () => void;
  title: string;
}): JSX.Element {
  return createPortal(
    <PortalImpl 
      onClose={onClose}
      title={title} 
      closeOnClickOutside={closeOnClickOutside}
    >
      {children}
    </PortalImpl>,
    document.body
  );
}