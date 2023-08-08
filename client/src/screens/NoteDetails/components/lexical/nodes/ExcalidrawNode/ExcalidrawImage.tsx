import { useEffect, useState } from "react";

import { exportToCanvas } from "@excalidraw/excalidraw";
import { ExcalidrawElement, NonDeleted } from "@excalidraw/excalidraw/types/element/types";
import { AppState } from "@excalidraw/excalidraw/types/types";

type ImageType = "svg" | "canvas";

type Props = {
  /**
   * Configures the export setting for SVG/Canvas
   */
  appState?: Partial<Omit<AppState, "offsetTop" | "offsetLeft">> | null;
  /**
   * The css class applied to image to be rendered
   */
  className?: string;
  /**
   * The Excalidraw elements to be rendered as an image
   */
  elements: NonDeleted<ExcalidrawElement>[];
  /**
   * The height of the image to be rendered
   */
  height?: number | null;
  /**
   * The ref object to be used to render the image
   */
  imageContainerRef: { current: null | HTMLImageElement };
  /**
   * The type of image to be rendered
   */
  imageType?: ImageType;
  /**
   * The css class applied to the root element of this component
   */
  rootClassName?: string | null;
  /**
   * The width of the image to be rendered
   */
  width?: number | null;
};

/**
 * @explorer-desc
 * A component for rendering Excalidraw elements as a static image
 */
export default function ExcalidrawImage({
  elements,
  imageContainerRef,
  appState = null  
}: Props): JSX.Element {
  const [imageURL, setImageURL] = useState('');

  useEffect(() => {
    const setContent = async () => {
      const canvas = await exportToCanvas({ elements, files: null });
      const ctx = canvas.getContext("2d");

      if(ctx) {
        ctx.font = "30px Virgil";
        setImageURL(canvas.toDataURL());
      }
    };
    setContent();
  }, [elements, appState]);

  return (
    <div>
      <img 
        src={imageURL} 
        ref={imageContainerRef}
        className="!rounded-lg !object-cover xxs:!max-h-96 xxs:!w-screen sm:!max-h-96 xl:!object-fill xl:!max-h-screen"
      />
    </div>
  );
}