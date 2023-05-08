import {
    SetStateAction,
    Dispatch,
    useState,
    useContext
} from 'react';

import { useForm, FieldValues } from 'react-hook-form';

import { BsThreeDotsVertical } from 'react-icons/bs';
import { AiFillTags } from 'react-icons/ai';

import { HexColorPicker } from "react-colorful";

import Modal from '../../../../../components/Modal';
import { toastAlert } from '../../../../../components/Alert/Alert';
import ConfirmationModal from '../../../../../components/ConfirmationModal';

import { LabelsCtx } from '../../../../../context/LabelCtx';

import api from '../../../../../services/api';

type Props = {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    token: {
        googleAccount: boolean;
        token: string;
        name: string;
        _id: string;
    };
}

type Label = {
    _id: string;
    name: string;
    color: string;
    fontColor: string;
    editName: string;
    outlined: string;
    default: string;
}

export default function LabelModal({ open, setOpen, token }: Props) {
    const [ loader, setLoader ] = useState(false);
    const [ color, setColor ] = useState("#0e63b9");
    const [ fontColor, setFontColor ] = useState("#ffffff");
    const [ deleteModal, setDeleteModal ] = useState(false);
    const [ selectedStyle, setSelectedStyle ] = useState('');
    const [ editId, setEditId ] = useState<string | null>(null);
    const [ showColorPicker, setShowColorPicker ] = useState('');
    const [ showDropDown, setShowDropDown ] = useState<number | null>(null);
    const [ createLabel, setCreateLabel ] = useState<string | boolean>(false);
    const [ selectedLabel, setSelectedLabel ] = useState<string | null>(null);

    const { handleSubmit, register, formState, reset } = useForm<Label>();
 
    const { errors } = formState;

    const labelData = useContext(LabelsCtx);

    const labels = labelData?.labels;
    
    const closeModal = () => {
        setOpen(false);
        setTimeout(() => {
            setCreateLabel(false);
        }, 500);
    }
    
    const openDeleteModal = (chip: Label) => {
        setDeleteModal(true);
        setSelectedLabel(chip._id);
    }

    const closeDeleteModal = () => {
        setDeleteModal(false);
        setSelectedLabel(null);
    }
        
    const addLabel = async (data: FieldValues) => {
        setLoader(true);
        
        if(selectedStyle.length > 0) {
            try {
                const { name } = data;
    
                const newLabel = await api.post(`https://noap-typescript-api.vercel.app/label/add/${token._id}/${token.token}`, {
                    color,
                    fontColor,
                    name,
                    selectedStyle
                });
    
                setLoader(false);
                labelData?.fetchLabels();
                toastAlert({icon: 'success', title: `${newLabel.data.message}`, timer: 3000});
            } catch (err: any) {
                console.log(err);
                setLoader(false);
                toastAlert({icon: 'error', title: `${err.reponse.data.message}`, timer: 3000});
            }
        }
        else {
            setLoader(false);
            return toastAlert({
                icon: 'error',
                title: `Please, select a label type!`, 
                timer: 3000
            });
        }
    }

    const deleteLabel = async () => {
        if(selectedLabel) {
            setLoader(true);
        
            try {
                const deleteL = await api.delete(`https://noap-typescript-api.vercel.app/label/delete/${selectedLabel}/${token.token}`)

                toastAlert({icon: 'success', title: `${deleteL.data.message}`, timer: 3000});
                setLoader(false);
                closeDeleteModal();
                
                const findLabel = labels?.find(({_id}: any) => selectedLabel);
                labelData?.removeLabels(labels?.indexOf(findLabel as any));
                
                labelData?.fetchLabels();
            } catch (err: any) {
                console.log(err);
                setLoader(false);
                toastAlert({icon: 'error', title: `${err.reponse.data.message}`, timer: 3000});
            }
        }
        else {
            setLoader(false);
            toastAlert({icon: 'error', title: `Please, select a label to delete`, timer: 3000});
        }
    }

    const resetLabelInfoToEdit = (chip: Label) => {
        const { _id, name, color, fontColor, type } : any = labels?.find(({_id}) => _id === chip._id);
        
        reset({ editName: name });
        setEditId(_id);
        setColor(color);
        setFontColor(fontColor);
        setCreateLabel('edit');
    }

    const editLabel = async (data: FieldValues) => {
        setLoader(true);

        if(selectedStyle) {
            try {
                const editL = await api.patch(`https://noap-typescript-api.vercel.app/label/edit/${token._id}/${token.token}`, {
                    name: data.editName,
                    _id: editId,
                    color,
                    fontColor
                });

                setLoader(false);
                labelData?.fetchLabels();
                toastAlert({icon: 'success', title: `${editL.data.message}`, timer: 3000});
            } catch (err: any) {
                setLoader(false);
                toastAlert({icon: 'error', title: `${err.reponse.data.message}`, timer: 3000});
            }
        }
        else {
            setLoader(false);
            return toastAlert({
                icon: 'error',
                title: `Please, select a label type!`, 
                timer: 3000
            });
        }
    }

    return (
        <div>
            <Modal
                open={open}
                setOpen={setOpen}
                onClose={closeModal}
                title='Labels'
                titleWrapperClasName="px-6"
                modalWrapperClassName={`xxs:!w-[18rem] !px-0 !w-[23rem] max-h-[27.5rem] overflow-hidden ${createLabel && '!max-h-none'}`}
            >
                <>
                    {!createLabel ? (
                        <>
                            <div className="mb-8 mt-5 text-gray-300 px-6 ">
                                <p className='text-base uppercase tracking-widest'>Your labels</p>
                                {labels && labels?.length > 0 ? (
                                    <>
                                        {labelData?.isFetching ? (
                                                <div
                                                    className='flex flex-row justify-center animate-pulse my-12'
                                                >
                                                    <svg
                                                        aria-hidden="true"
                                                        role="status"
                                                        className="inline w-5 h-5 mr-3 text-white animate-spin xxs:my-1 my-[1.5px]"
                                                        viewBox="0 0 100 101"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                    <path
                                                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                                        fill="#E5E7EB"
                                                    />
                                                    <path
                                                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                                        fill="currentColor"
                                                    />
                                                    </svg>
                                                    <span className="pb-[2px] xxs:pt-[2.4px] uppercase tracking-widest">
                                                        Loading...
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col space-y-2 mt-4 text-sm px-1 max-h-[12.8rem] overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-900">
                                                    {labels?.map((chip: any, idx: number) => {
                                                        return (                                        
                                                            <div className="flex space-x-2 justify-between pr-2" key={idx}>
                                                                {chip.type === 'outlined' ? (
                                                                    <div 
                                                                    className="badge badge-accent badge-outline !py-3 uppercase text-xs tracking-widest truncate"
                                                                    style={{
                                                                        borderColor: chip.color,
                                                                        color: chip.color
                                                                    }}
                                                                >
                                                                    {chip.name.length > 25 ? chip.name.slice(0,24) + '...' : chip.name}
                                                                </div>
                                                                ) : (
                                                                    <div 
                                                                        className="badge badge-accent !py-3 uppercase text-xs tracking-widest truncate"
                                                                        style={{
                                                                            backgroundColor: chip.color,
                                                                            borderColor: chip.color,
                                                                            color: chip.fontColor
                                                                        }}
                                                                    >
                                                                        {chip.name.length > 25 ? chip.name.slice(0,24) + '...' : chip.name}
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center justify-center">
                                                                    <div className='tooltip tooltip-left' data-tip="Actions">
                                                                        <div className="dropdown dropdown-left">
                                                                            <label tabIndex={0}>
                                                                                <BsThreeDotsVertical 
                                                                                    size={16} 
                                                                                    className=''
                                                                                    onClick={() => setShowDropDown(idx)}
                                                                                /> 
                                                                            </label>
                                                                            <ul 
                                                                                tabIndex={0} 
                                                                                className="dropdown-content menu shadow rounded-box w-36 !bg-gray-900"
                                                                                style={idx !== showDropDown ? {display: 'none'}: undefined}
                                                                                
                                                                            >
                                                                                <li className="text-xs uppercase tracking-widest">
                                                                                    <a 
                                                                                        className="active:!bg-gray-600"
                                                                                        onClick={() => resetLabelInfoToEdit(chip)}
                                                                                    >
                                                                                        Edit label
                                                                                    </a>
                                                                                </li>
                                                                                <li className="text-xs uppercase tracking-widest">
                                                                                    <a
                                                                                        id="delete"
                                                                                        className="active:!bg-gray-600"
                                                                                        onClick={() => openDeleteModal(chip)}
                                                                                    >
                                                                                        Delete label
                                                                                    </a>
                                                                                </li>
                                                                            </ul>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>    
                                            )
                                        }
                                    </>
                                ) : (
                                    <div className="flex flex-col space-y-4 items-center justify-center mt-5 text-gray-500">
                                        <AiFillTags size={60} className='!mt-5'/>
                                        <p className='text-[13px] uppercase tracking-widest !mb-9 xxs:text-xs'>Your labels will appear here!</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-center items-center border border-transparent border-t-gray-600">
                                <button 
                                    className='text-sm uppercase text-gray-200 rounded-full mt-5'
                                    onClick={() => setCreateLabel(true)}
                                >
                                    <span className='px-6 py-1 rounded-full transition-all duration-500 border border-transparent hover:text-[15px]'>
                                        Add a new label
                                    </span>
                                </button>
                            </div>
                        </>
                    ) : createLabel && createLabel !== 'edit' ? (
                        <div className="mt-5">
                            <div className="text-gray-200 px-6 mb-3">
                                <p className='text-lg tracking-tight font-light'>
                                    Add a new label
                                </p>
                            </div>
                            <div className="flex flex-col px-6 space-y-3">
                                <p className='text-sm text-gray-400 !mb-4 uppercase tracking-widest'>
                                    First, select the type of the label
                                </p>

                                <div className="flex">
                                    <input 
                                        type="radio" 
                                        name="radio-1" 
                                        className="radio !bg-gray-600 !border-gray-400" 
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
                                        className="radio !bg-gray-600 !border-gray-400"
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
                            <div className={`mt-6 !mb-0 `}>
                                <p className='text-sm text-gray-400 !mb-4 uppercase tracking-widest px-6'>
                                    Now, enter the label details
                                </p>
                                <div className="mt-2 flex flex-col space-y-4">
                                    <form noValidate onSubmit={handleSubmit(addLabel)}>
                                        <div className="px-6">
                                            <p className="text-red-500 ml-1 !mb-2 uppercase text-xs tracking-widest">
                                                {errors.name?.message as string}
                                            </p>
                                            <input
                                                type="text"
                                                className={`sign-text-inputs bg-stone-900 text-gray-300 border-transparent active:border focus:border-gray-400 ${errors.name?.message && 'border border-red-600 focus:border-red-600 active:border-red-600'}`}
                                                placeholder="Name"
                                                required
                                                {...register("name", {
                                                    required: "Name is required!"
                                                })}
                                            />   
                                    
                                            <div className="flex flex-col space-y-3 mt-5 !text-gray-400">
                                                <label className='text-xs uppercase tracking-widest'>
                                                    Pick a color: {""} 
                                                    <button
                                                        type='button'
                                                        className='rounded-full ml-1 border border-gray-400 w-fit py-[1px]'
                                                        style={{
                                                            backgroundColor: color
                                                        }}
                                                    >
                                                        <span 
                                                            onClick={() => setShowColorPicker('color')}
                                                            className='text-gray-900 px-2'
                                                            style={{
                                                                color
                                                            }}
                                                        >
                                                            ............
                                                        </span>
                                                    </button>
                                                </label>
                                                {showColorPicker === 'color' && (
                                                    <div 
                                                        className="absolute xxs:top-[16rem] xxs:left-[3rem] top-[14rem] left-[5.4rem] flex flex-col"
                                                        style={selectedStyle === 'default' && window.innerWidth <= 639 ? {
                                                            top: '18rem'
                                                        } : selectedStyle === 'default' && window.innerWidth > 639 ? {
                                                            top: '16rem'
                                                        } : undefined}
                                                    >
                                                        <HexColorPicker color={color} onChange={setColor} />
                                                        <button 
                                                            type='button'
                                                            className='text-sm uppercase tracking-widest rounded-full mx-auto my-2 xxs:!mt-4'
                                                        >
                                                            <span
                                                                className='xxs:py-2 py-1 rounded-full px-10 bg-black text-gray-100'
                                                                onClick={() => setShowColorPicker('')}
                                                            >
                                                                close
                                                            </span>
                                                        </button>
                                                    </div>
                                                )}
                                                {selectedStyle === 'default' && (
                                                    <label className='text-xs uppercase tracking-widest'>
                                                        Pick a text color: {""} 
                                                        <button
                                                            type='button'
                                                            className='rounded-full ml-1 border border-gray-400 w-fit py-[1px]'
                                                            style={{ backgroundColor: fontColor }}
                                                        >
                                                            <span 
                                                                className='px-2 '
                                                                onClick={() => setShowColorPicker('fontColor')}
                                                                style={{ color: fontColor }}
                                                            >
                                                                ............
                                                            </span>
                                                        </button>
                                                    </label>
                                                )}
                                                {showColorPicker === 'fontColor' && (
                                                    <div 
                                                        className="absolute xxs:top-[18rem] xxs:left-[3rem] top-[16rem] left-[5.4rem] flex flex-col"
                                                        style={selectedStyle !== 'default' && window.innerWidth <= 639 ? {
                                                            top: '16rem'
                                                        } : selectedStyle !== 'default' && window.innerWidth > 639 ? {
                                                            top: '14rem'
                                                        } : undefined}
                                                    >
                                                        <HexColorPicker color={fontColor} onChange={setFontColor} />
                                                        <button 
                                                            type='button'
                                                            className='text-sm uppercase tracking-widest rounded-full mx-auto my-2 xxs:!mt-4'
                                                        >
                                                            <span
                                                                className='xxs:py-2 py-1 bg-black rounded-full px-10'
                                                                onClick={() => setShowColorPicker('')}
                                                            >
                                                                close
                                                            </span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className='mt-5 text-gray-100 !px-0'>
                                            <div className='border border-transparent border-t-gray-600 w-full flex justify-center items-center pt-3'>
                                                <button 
                                                    type={loader ? 'button' : 'submit'}
                                                    className='text-sm uppercase tracking-widest rounded-full px-8 pt-2 transition-all hover:text-[15px] duration-500'
                                                >
                                                    {!loader ? (
                                                        <>
                                                            Create label
                                                        </>
                                                    ): (
                                                        <div
                                                            className='flex flex-row justify-center animate-pulse'
                                                        >
                                                            <svg
                                                                aria-hidden="true"
                                                                role="status"
                                                                className="inline w-4 h-4 mr-3 text-white animate-spin xxs:my-1 my-[1.5px]"
                                                                viewBox="0 0 100 101"
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                            <path
                                                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                                                fill="#E5E7EB"
                                                            />
                                                            <path
                                                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                                                fill="currentColor"
                                                            />
                                                            </svg>
                                                            <span className="pb-[2px] xxs:pt-[2.4px]">
                                                                Loading...
                                                            </span>
                                                        </div>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-5">
                            <div className="text-gray-200 px-6 mb-3">
                                <p className='text-lg tracking-tight font-light'>
                                    Edit label
                                </p>
                            </div>
                            <div className="flex flex-col px-6 space-y-3">
                                <p className='text-sm text-gray-400 !mb-4 uppercase tracking-widest'>
                                    First, select the type of the label
                                </p>

                                <div className="flex">
                                    <input 
                                        type="radio" 
                                        name="radio-1" 
                                        className="radio !bg-gray-600 !border-gray-400" 
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
                                        className="radio !bg-gray-600 !border-gray-400" 
                                        // open={selectedStyle === 'outlined' && true}
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
                            <div className={`mt-6 !mb-0 `}>
                                <p className='text-sm text-gray-400 !mb-4 uppercase tracking-widest px-6'>
                                    Now, enter the label details
                                </p>
                                <div className="mt-2 flex flex-col space-y-4">
                                    <form noValidate onSubmit={handleSubmit(editLabel)}>
                                        <div className="px-6">
                                            <p className="text-red-500 ml-1 !mb-2 uppercase text-xs tracking-widest">
                                                {errors.editName?.message as string}
                                            </p>
                                            <input
                                                type="text"
                                                className={`sign-text-inputs bg-stone-900 text-gray-300 border-transparent active:border focus:border-gray-400 ${errors.name?.message && 'border border-red-600 focus:border-red-600 active:border-red-600'}`}
                                                placeholder="Name"
                                                required
                                                {...register("editName", {
                                                    required: "Name is required!"
                                                })}
                                            />   
                                    
                                            <div className="flex flex-col space-y-3 mt-5 !text-gray-400">
                                                <label className='text-xs uppercase tracking-widest'>
                                                    Pick a color: {""} 
                                                    <button
                                                        type='button'
                                                        className='rounded-full ml-1 border border-gray-400 w-fit py-[1px]'
                                                        style={{
                                                            backgroundColor: color
                                                        }}
                                                    >
                                                        <span 
                                                            onClick={() => setShowColorPicker('color')}
                                                            className='text-gray-900 px-2'
                                                            style={{
                                                                color
                                                            }}
                                                        >
                                                            ............
                                                        </span>
                                                    </button>
                                                </label>
                                                {showColorPicker === 'color' && (
                                                    <div 
                                                        className="absolute xxs:top-[16rem] xxs:left-[3rem] top-[14rem] left-[5.4rem] flex flex-col"
                                                        style={selectedStyle === 'default' && window.innerWidth <= 639 ? {
                                                            top: '18rem'
                                                        } : selectedStyle === 'default' && window.innerWidth > 639 ? {
                                                            top: '16rem'
                                                        } : undefined}
                                                    >
                                                        <HexColorPicker color={color} onChange={setColor} />
                                                        <button 
                                                            type='button'
                                                            className='text-sm uppercase tracking-widest rounded-full mx-auto my-2 xxs:!mt-4'
                                                        >
                                                            <span
                                                                className='xxs:py-2 py-1 rounded-full px-10 bg-black text-gray-100'
                                                                onClick={() => setShowColorPicker('')}
                                                            >
                                                                close
                                                            </span>
                                                        </button>
                                                    </div>
                                                )}
                                                {selectedStyle === 'default' && (
                                                    <label className='text-xs uppercase tracking-widest'>
                                                        Pick a text color: {""} 
                                                        <button
                                                            type='button'
                                                            className='rounded-full ml-1 border border-gray-400 w-fit py-[1px]'
                                                            style={{ backgroundColor: fontColor }}
                                                        >
                                                            <span 
                                                                className='px-2 '
                                                                onClick={() => setShowColorPicker('fontColor')}
                                                                style={{ color: fontColor }}
                                                            >
                                                                ............
                                                            </span>
                                                        </button>
                                                    </label>
                                                )}
                                                {showColorPicker === 'fontColor' && (
                                                    <div 
                                                        className="absolute xxs:top-[18rem] xxs:left-[3rem] top-[16rem] left-[5.4rem] flex flex-col"
                                                        style={selectedStyle !== 'default' && window.innerWidth <= 639 ? {
                                                            top: '16rem'
                                                        } : selectedStyle !== 'default' && window.innerWidth > 639 ? {
                                                            top: '14rem'
                                                        } : undefined}
                                                    >
                                                        <HexColorPicker color={fontColor} onChange={setFontColor} />
                                                        <button 
                                                            type='button'
                                                            className='text-sm uppercase tracking-widest rounded-full mx-auto my-2 xxs:!mt-4'
                                                        >
                                                            <span
                                                                className='xxs:py-2 py-1 bg-black rounded-full px-10'
                                                                onClick={() => setShowColorPicker('')}
                                                            >
                                                                close
                                                            </span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className='mt-5 text-gray-100 !px-0'>
                                            <div className='border border-transparent border-t-gray-600 w-full flex justify-center items-center pt-3'>
                                                <button 
                                                    type={loader ? 'button' : 'submit'}
                                                    className='text-sm uppercase tracking-widest rounded-full px-8 pt-2 transition-all hover:text-[15px] duration-500'
                                                >
                                                    {!loader ? (
                                                        <>
                                                            Edit label
                                                        </>
                                                    ): (
                                                        <div
                                                            className='flex flex-row justify-center animate-pulse'
                                                        >
                                                            <svg
                                                                aria-hidden="true"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                            <path
                                                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                                                fill="#E5E7EB"
                                                            />
                                                            <path
                                                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                                                fill="currentColor"
                                                            />
                                                            </svg>
                                                            <span className="pb-[2px] xxs:pt-[2.4px]">
                                                                Loading...
                                                            </span>
                                                        </div>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}   
                </>
            </Modal>
            <ConfirmationModal
                loader={loader}
                open={deleteModal}
                setOpen={setDeleteModal}
                onClose={closeDeleteModal}
                deleteButtonAction={deleteLabel}
                mainText='Are you sure you want to delete this label?'
                modalWrapperClassName={`!w-96`}
            />
        </div>
    )
}