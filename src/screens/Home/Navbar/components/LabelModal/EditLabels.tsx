import { Dispatch, SetStateAction } from "react";
import { FieldValues, UseFormHandleSubmit, UseFormRegister, FieldErrors } from "react-hook-form";
import { HexColorPicker } from "react-colorful";

import SvgLoader from "../../../../../components/SvgLoader";
import { toastAlert } from "../../../../../components/Alert";
import useLabel from "../../../../../hooks/useLabel";
import useUserData from "../../../../../hooks/useUserData";

import api from "../../../../../services/api";

type Label = {
    _id: string;
    name: string;
    color: string;
    fontColor: string;
    editName: string;
    outlined: string;
    default: string;
};

type Props = {
    setSelectedStyle: Dispatch<SetStateAction<"default" | "outlined">>;
    color: string;
    fontColor: string;
    setLoader: Dispatch<SetStateAction<boolean>>;
    errors: FieldErrors<Label>;
    handleSubmit: UseFormHandleSubmit<Label, undefined>;
    register: UseFormRegister<Label>;
    setShowColorPicker: Dispatch<SetStateAction<string>>;
    showColorPicker: string;
    selectedStyle: "default" | "outlined";
    setColor: Dispatch<SetStateAction<string>>;
    setFontColor: Dispatch<SetStateAction<string>>;
    loader: boolean;
    editId: string | null;
};

export default function EditLabel({
    setSelectedStyle,
    color,
    fontColor,
    errors,
    handleSubmit,
    register,
    setShowColorPicker,
    showColorPicker,
    selectedStyle,
    setColor,
    setFontColor,
    loader,
    setLoader,
    editId
}: Props) {
    const { userData: { _id: userId } } = useUserData();
    const { fetchLabels } = useLabel();

    const editLabel = async ({ editName }: FieldValues) => {
        setLoader(true);

        if(!selectedStyle) {
            setLoader(false);
            return toastAlert({ icon: 'error', title: `Please, select a label type!`, timer: 3000 });
        }        
        
        try {
            await api.patch(`/label/edit/${userId}`, {
                name: editName,
                _id: editId,
                color,
                fontColor
            });

            setLoader(false);
            if(fetchLabels) fetchLabels();
            toastAlert({ icon: 'success', title: "Label updated!", timer: 3000 });
        } catch (err: any) {
            setLoader(false);
            toastAlert({ icon: 'error', title: err.message, timer: 3000 });
        }
    };

    return (
        <div className="mt-5 xxs:max-h-96 overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-900 dark:scrollbar-thumb-gray-300">
            <div className="px-6 mb-3">
                <p className='text-lg tracking-tight font-light'>Edit label</p>
            </div>
            <div className="flex flex-col px-6 space-y-3">
                <p className='text-sm text-gray-500 !mb-4 uppercase tracking-widest'>First, select the type of the label</p>
                <div className="flex">
                    <input 
                        type="radio" 
                        name="radio-1" 
                        className="radio bg-[#eeeff1] dark:bg-gray-600 border-gray-700 dark:border-gray-500" 
                        onClick={() => setSelectedStyle('default')}
                    />
                    <div className="ml-6">
                        <div 
                            className="badge badge-accent !py-3 uppercase text-xs tracking-widest"
                            style={{ backgroundColor: color, borderColor: color, color: fontColor }}
                        >
                            first style
                        </div>
                    </div>
                </div>
                <div className="flex">
                    <input 
                        type="radio" 
                        name="radio-1" 
                        className="radio bg-[#eeeff1] dark:bg-gray-600 border-gray-700 dark:border-gray-500" 
                        onClick={() => setSelectedStyle('outlined')}
                    />
                    <div className="ml-6">
                        <div
                            className="badge badge-accent badge-outline !py-3 uppercase text-xs tracking-widest"
                            style={{ borderColor: color, color: color }}
                        >
                            second style
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-6 !mb-0">
                <p className='text-sm text-gray-500 !mb-4 uppercase tracking-widest px-6'>
                    Now, enter the label details
                </p>
                <div className="mt-2 flex flex-col space-y-4">
                    <form noValidate onSubmit={handleSubmit(editLabel)}>
                        <div className="px-6">
                            <p className="text-red-500 ml-1 !mb-2 uppercase text-xs tracking-widest">
                                {errors.editName?.message as string}
                            </p>
                            <input
                                className={`sign-text-inputs text-gray-900 dark:text-gray-300 dark:bg-stone-900 shadow-none border dark:border-[#404040] border-stone-400 ${errors.name?.message && 'border border-red-600 focus:border-red-600 active:border-red-600'}`}
                                placeholder="Name"
                                {...register("editName", { required: "Name is required!" })}
                            />   
                            <div className="flex flex-col space-y-3 mt-5">
                                <label className='text-xs uppercase tracking-widest'>
                                    Pick a color: {""} 
                                    <button 
                                        type="button" 
                                        className="rounded-full ml-1 border dark:border-gray-400 border-gray-900 w-fit py-[1px]"
                                        style={{ backgroundColor: color }}
                                    >
                                        <span className='text-gray-900 px-8' onClick={() => setShowColorPicker('color')} style={{ color }} />
                                    </button>
                                </label>
                                {showColorPicker === 'color' && (
                                    <div className="absolute xxs:!top-[14rem] xxs:left-[3rem] top-[16rem] left-[5.4rem] flex flex-col">
                                        <HexColorPicker color={color} onChange={setColor} />
                                        <button 
                                            type="button"
                                            className="text-sm uppercase tracking-widest rounded-full mx-auto my-2 xxs:!mt-4"
                                        >
                                            <span className='xxs:py-2 py-1 rounded-full px-10 bg-black text-gray-100' onClick={() => setShowColorPicker('')}>
                                                close
                                            </span>
                                        </button>
                                    </div>
                                )}
                                {selectedStyle === 'default' && (
                                    <label className='text-xs uppercase tracking-widest'>
                                        Pick a text color: {""} 
                                        <button 
                                            type="button" 
                                            className='rounded-full ml-1 border dark:border-gray-400 border-gray-900 w-fit py-[1px]' 
                                            style={{ backgroundColor: fontColor }}
                                        >
                                            <span 
                                                className="px-8" 
                                                onClick={() => setShowColorPicker('fontColor')} 
                                                style={{ color: fontColor }} 
                                            />
                                        </button>
                                    </label>
                                )}
                                {showColorPicker === 'fontColor' && (
                                    <div className="absolute xxs:!top-[14rem] xxs:left-[3rem] top-[16rem] left-[5.4rem] flex flex-col">
                                        <HexColorPicker color={fontColor} onChange={setFontColor} />
                                        <button 
                                            className='text-sm uppercase tracking-widest rounded-full mx-auto my-2 xxs:!mt-4' 
                                            type='button'
                                        >
                                            <span className='xxs:py-2 py-1 rounded-full px-10 bg-black text-gray-100' onClick={() => setShowColorPicker('')}>
                                                close
                                            </span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className='mt-5 !px-0 border border-transparent border-t-gray-600 w-full flex justify-center items-center pt-3'>
                            <button
                                type={loader ? 'button' : 'submit'} 
                                className='text-sm uppercase tracking-widest rounded-full px-8 pt-2 transition-all hover:text-[15px] duration-500'
                            >
                                {!loader ? "Edit label" : <SvgLoader options={{ showLoadingText: true }}/>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}