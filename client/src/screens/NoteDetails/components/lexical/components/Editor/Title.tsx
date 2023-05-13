import { UseFormRegister, FieldValues } from "react-hook-form";

type TitleProps = {
    register: UseFormRegister<FieldValues>;
    disableToolbar: () => void;
    currentScreenSize: number;
    noteCtx: any;
};

export default function TitleInput({ register, noteCtx, disableToolbar, currentScreenSize }: TitleProps) {
    return (
      <div
        className="text-3xl mt-10 px-6 flex flex-wrap xxs:text-2xl"
        style={!noteCtx?.expanded ? { width: currentScreenSize - 430 } : { width: currentScreenSize }}
      >
        <textarea
          id="note-title"
          onClick={() => disableToolbar()}
          rows={ currentScreenSize > 640 ? 1 : 2 }
          wrap="hard"
          spellCheck="false"
          className="!bg-gray-700 w-full px-1 placeholder-gray-400 focus:outline-none resize-none"
          placeholder=" Enter a title"
          {...register("title")}
        />
      </div>
    );
  }