import {
    SetStateAction,
    Dispatch,
    useState
} from 'react';

import { BsFillTagFill } from 'react-icons/bs';

import { HexColorPicker } from "react-colorful";

type Props = {
    checked: boolean;
    setChecked: Dispatch<SetStateAction<boolean>>;
}

export default function LabelDialog({checked, setChecked}: Props) {
    const [ color, setColor ] = useState("#aabbcc");
    const [ fontColor, setFontColor ] = useState("#ffffff");
    const [ createLabel, setCreateLabel ] = useState(false);
    const [ selectedStyle, setSelectedStyle ] = useState('');
    const [ showColorPicker, setShowColorPicker ] = useState('');

    const closeModal = () => {
        setChecked(false);
        setTimeout(() => {
            setCreateLabel(false);
        }, 500);
    }

    return (
        <div>
            <input
                checked={checked}
                readOnly
                type="checkbox"
                className="modal-toggle"
            />
            <label htmlFor="my-modal-4" className="modal cursor-pointer light">
                <label className={`px-0 modal-box !bg-gray-800 w-[22rem] ${createLabel && '!w-[23rem]'} !max-w-none relative transition-all duration-500`}>
                    <div className="flex flex-row justify-between border border-transparent border-b-gray-600 px-6 pb-5">
                        <h3 className="text-2xl tracking-tight font-light text-gray-200">Labels</h3>
                        <label 
                            htmlFor="my-modal-4" 
                            className="btn btn-sm btn-circle bg-gray-700"
                            onClick={() => closeModal()}
                        >
                            ✕
                        </label>
                    </div>
                    {!createLabel ? (
                        <>
                            <div className="mb-8 mt-5 text-gray-300 px-6">
                                <p className='text-base uppercase tracking-widest'>Your labels</p>
                                <div className="flex flex-col space-y-2 mt-4 text-sm px-1">
                                    <div className="flex space-x-2">
                                        <BsFillTagFill size={20} />
                                        <p>Label one</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <BsFillTagFill size={20} />
                                        <p>Label one</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <BsFillTagFill size={20} />
                                        <p>Label one</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-center items-center border border-transparent border-t-gray-600">
                                <button 
                                    className='text-sm uppercase text-gray-200 rounded-full mt-5'
                                    onClick={() => setCreateLabel(true)}
                                >
                                    <span className='px-6 py-2 rounded-full transition-all duration-500 border border-transparent hover:text-[15px]'>
                                        Add a new label
                                    </span>
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="mt-5">
                            <div className="text-gray-200 px-6 mb-1">
                                <p className='text-lg tracking-tight font-light'>
                                    Add a new label
                                </p>
                            </div>
                            <div className="flex flex-col px-6 space-y-3">
                                <p className='text-base text-gray-400 !mb-4'>
                                    First, select the type of the label
                                </p>

                                <div className="flex">
                                    <input 
                                        type="radio" 
                                        name="radio-1" 
                                        className="radio" 
                                        onClick={() => setSelectedStyle('default')}
                                    />
                                    <div className="ml-6">
                                        <div 
                                            className="badge badge-accent !py-3 uppercase text-xs tracking-widest"
                                            style={{
                                                backgroundColor: color,
                                                borderColor: color,
                                                color: fontColor
                                            }}
                                        >
                                            first style
                                        </div>
                                    </div>
                                </div>
                                <div className="flex">
                                    <input 
                                        type="radio" 
                                        name="radio-1" 
                                        className="radio" 
                                        // checked={selectedStyle === 'outlined' && true}
                                        onClick={() => setSelectedStyle('outlined')}
                                    />
                                    <div className="ml-6">
                                        <div 
                                            className="badge badge-accent badge-outline !py-3 uppercase text-xs tracking-widest"
                                            style={{
                                                borderColor: color,
                                                color: color
                                            }}
                                        >
                                            second style
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={`my-5 px-6 ${showColorPicker && '!mb-6'}`}>
                                <p className='text-base text-gray-400 mb-5'>
                                    Now, enter the label details
                                </p>
                                <div className="mt-2 flex flex-col space-y-4">
                                    <input
                                        type="text"
                                        className={`sign-text-inputs bg-stone-900 text-gray-300 border-transparent active:border focus:border-gray-400`}
                                        placeholder="Name"
                                        required
                                        // {...register("email", {
                                        //     required: "Email is required!",
                                        //     pattern: {
                                        //     value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
                                        //     message: "Invalid email!"
                                        //     }
                                        // })}
                                    />   
                                    <div className="flex flex-col space-y-2">
                                        <label className=''>
                                            Pick a color: {""} 
                                            <button
                                                onClick={() => setShowColorPicker('color')}
                                                className='bg-gray-900 rounded-full px-3 ml-1 border border-gray-600'
                                            >
                                                <span className='text-gray-900'>............</span>
                                            </button>
                                        </label>
                                        {showColorPicker === 'color' && (
                                            <div className="absolute top-52 left-[7.3rem] flex flex-col">
                                                <HexColorPicker color={color} onChange={setColor} />
                                                <button 
                                                    className='text-sm uppercase tracking-widest rounded-full mx-auto my-2'
                                                >
                                                    <span
                                                        className='py-1 bg-gray-900 rounded-full px-10'
                                                        onClick={() => setShowColorPicker('')}
                                                    >
                                                        close
                                                    </span>
                                                </button>
                                            </div>
                                        )}
                                        {selectedStyle === 'default' && (
                                            <label className=''>
                                                Pick a font color: {""} 
                                                <button
                                                    onClick={() => setShowColorPicker('fontColor')}
                                                    className='bg-gray-900 rounded-full px-3 ml-1 border border-gray-600'
                                                >
                                                    <span className='text-gray-900'>............</span>
                                                </button>
                                            </label>
                                        )}
                                        {showColorPicker === 'fontColor' && (
                                            <div className="absolute top-52 left-[7.3rem] flex flex-col">
                                                <HexColorPicker color={fontColor} onChange={setFontColor} />
                                                <button 
                                                    className='text-sm uppercase tracking-widest rounded-full mx-auto my-2'
                                                >
                                                    <span
                                                        className='py-1 bg-gray-900 rounded-full px-10'
                                                        onClick={() => setShowColorPicker('')}
                                                    >
                                                        close
                                                    </span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}  
                </label>
            </label>
        </div>
    )
}