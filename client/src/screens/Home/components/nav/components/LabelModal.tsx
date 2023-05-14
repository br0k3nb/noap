import { SetStateAction, Dispatch, useState, useContext } from 'react';
import { useForm, FieldValues } from 'react-hook-form';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { HexColorPicker } from "react-colorful";
import { AiFillTags } from 'react-icons/ai';

import Modal from '../../../../../components/Modal';
import { toastAlert } from '../../../../../components/Alert/Alert';
import ConfirmationModal from '../../../../../components/ConfirmationModal';
import SvgLoader from '../../../../../components/SvgLoader';

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
        setTimeout(() => setCreateLabel(false), 500);
    }
    
    const openDeleteModal = (chip: Label) => {
        setDeleteModal(true);
        setSelectedLabel(chip._id);
    }

    const closeDeleteModal = () => {
        setDeleteModal(false);
        setSelectedLabel(null);
    }
        
    const addLabel = async ({ name }: FieldValues) => {
        setLoader(true);

        if(selectedStyle.length === 0) {
            setLoader(false);
            return toastAlert({ icon: 'error', title: `Please, select a label type!`,  timer: 3000 });
        }

        try {
            const newLabel = await api.post(`/label/add/${token._id}/${token.token}`, {
                color,
                fontColor,
                name,
                selectedStyle
            });

            setLoader(false);
            labelData?.fetchLabels();
            toastAlert({ icon: 'success', title: `${newLabel.data.message}`, timer: 3000 });
        } catch (err: any) {
            setLoader(false);
            toastAlert({ icon: 'error', title: `${err.reponse.data.message}`, timer: 3000 });
        }
    }

    const deleteLabel = async () => {
        setLoader(true);

        if(selectedLabel) {
            setLoader(false);
            toastAlert({icon: 'error', title: `Please, select a label to delete`, timer: 3000});
        }

        try {
            const deleteL = await api.delete(`/label/delete/${selectedLabel}/${token.token}`)
            toastAlert({ icon: 'success', title: `${deleteL.data.message}`, timer: 3000 });
            setLoader(false);
            closeDeleteModal();
            
            const findLabel = labels?.find(({_id}) => _id === selectedLabel);
            labelData?.removeLabels(labels?.indexOf(findLabel as any));
            labelData?.fetchLabels();
        } catch (err: any) {
            setLoader(false);
            toastAlert({ icon: 'error', title: `${err.reponse.data.message}`, timer: 3000 });
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

    const editLabel = async ({ name }: FieldValues) => {
        setLoader(true);

        if(selectedStyle) {
            setLoader(false);
            return toastAlert({ icon: 'error', title: `Please, select a label type!`, timer: 3000 });
        }
        
        try {
            const editL = await api.patch(`/label/edit/${token._id}/${token.token}`, {
                name,
                _id: editId,
                color,
                fontColor
            });

            setLoader(false);
            labelData?.fetchLabels();
            toastAlert({ icon: 'success', title: `${editL.data.message}`, timer: 3000 });
        } catch (err: any) {
            setLoader(false);
            toastAlert({ icon: 'error', title: `${err.reponse.data.message}`, timer: 3000 });
        }
    }

    const modalProps = {
        open,
        setOpen,
        title: 'Labels',
        options: {
            onClose: closeModal,
            titleWrapperClassName: "px-6",
            modalWrapperClassName: `xxs:!w-[18rem] !px-0 !w-[23rem] max-h-[27.5rem] overflow-hidden ${createLabel && '!max-h-none'}`
        }
    }

    return (
        <>
            <Modal {...modalProps}>
                <>
                    {!createLabel ? (
                        <>
                            <div className="mb-8 mt-5 text-gray-300 px-6 ">
                                <p className='text-base uppercase tracking-widest'>Your labels</p>
                                {labels && labels?.length > 0 ? (
                                    <>
                                        {labelData?.isFetching ? ( <SvgLoader options={{ showLoadingText: true, wrapperClassName: "!mt-5" }} /> ) : 
                                            (<div className="flex flex-col space-y-2 mt-4 text-sm px-1 max-h-[12.8rem] overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-900">
                                                {labels?.map((chip: any, idx: number) => {
                                                    const { color, fontColor, name, type } = chip;

                                                    return (                                        
                                                        <div className="flex space-x-2 justify-between pr-2" key={idx}>
                                                            {type === 'outlined' ? (
                                                                <div 
                                                                    className="badge badge-accent badge-outline !py-3 uppercase text-xs tracking-widest truncate"
                                                                    style={{ borderColor: color, color }}
                                                                >
                                                                    {name.length > 25 ? name.slice(0,24) + '...' : name}
                                                                </div>
                                                            ) : (
                                                                <div 
                                                                    className="badge badge-accent !py-3 uppercase text-xs tracking-widest truncate"
                                                                    style={{ backgroundColor: color, borderColor: color, color: fontColor }}
                                                                >
                                                                    {name.length > 25 ? name.slice(0,24) + '...' : name}
                                                                </div>
                                                            )}
                                                            <div className="flex items-center justify-center">
                                                                <div className='tooltip tooltip-left' data-tip="Actions">
                                                                    <div className="dropdown dropdown-left">
                                                                        <label tabIndex={0}>
                                                                            <BsThreeDotsVertical size={16} onClick={() => setShowDropDown(idx)}/> 
                                                                        </label>
                                                                        <ul 
                                                                            tabIndex={0} 
                                                                            className="dropdown-content menu shadow rounded-box w-36 !bg-gray-900"
                                                                            style={idx !== showDropDown ? {display: 'none'}: undefined}
                                                                        >
                                                                            <li className="text-xs uppercase tracking-widest">
                                                                                <a className="active:!bg-gray-600" onClick={() => resetLabelInfoToEdit(chip)}>
                                                                                    Edit label
                                                                                </a>
                                                                            </li>
                                                                            <li className="text-xs uppercase tracking-widest">
                                                                                <a id="delete" className="active:!bg-gray-600" onClick={() => openDeleteModal(chip)}>
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
                                        )}
                                    </>
                                ) : (
                                    <div className="flex flex-col space-y-4 items-center justify-center mt-5 text-gray-500">
                                        <AiFillTags size={60} className='!mt-5'/>
                                        <p className='text-[13px] uppercase tracking-widest !mb-9 xxs:text-xs'>Your labels will appear here!</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-center items-center border border-transparent border-t-gray-600">
                                <button  className='text-sm uppercase text-gray-200 rounded-full mt-5' onClick={() => setCreateLabel(true)}>
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
                                        className="radio !bg-gray-600 !border-gray-400"
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
                                                className={`sign-text-inputs bg-stone-900 text-gray-300 border-transparent active:border focus:border-gray-400 ${errors.name?.message && 'border border-red-600 focus:border-red-600 active:border-red-600'}`}
                                                placeholder="Name"
                                                {...register("name", { required: "Name is required!" })}
                                            />   
                                    
                                            <div className="flex flex-col space-y-3 mt-5 !text-gray-400">
                                                <label className='text-xs uppercase tracking-widest'>
                                                    Pick a color: {""} 
                                                    <button type='button' className='rounded-full ml-1 border border-gray-400 w-fit py-[1px]' style={{ backgroundColor: color }}>
                                                        <span className='text-gray-900 px-8' onClick={() => setShowColorPicker('color')} style={{ color }} />
                                                    </button>
                                                </label>
                                                {showColorPicker === 'color' && (
                                                    <div 
                                                        className="absolute xxs:top-[16rem] xxs:left-[3rem] top-[14rem] left-[5.4rem] flex flex-col"
                                                        style={ selectedStyle === 'default' && window.innerWidth <= 639 ? { top: '18rem'} 
                                                        : selectedStyle === 'default' && window.innerWidth > 639 ? { top: '16rem' } : undefined }
                                                    >
                                                        <HexColorPicker color={color} onChange={setColor} />
                                                        <button type='button' className='text-sm uppercase tracking-widest rounded-full mx-auto my-2 xxs:!mt-4'>
                                                            <span className='xxs:py-2 py-1 rounded-full px-10 bg-black text-gray-100' onClick={() => setShowColorPicker('')}>
                                                                close
                                                            </span>
                                                        </button>
                                                    </div>
                                                )}
                                                {selectedStyle === 'default' && (
                                                    <label className='text-xs uppercase tracking-widest'>
                                                        Pick a text color: {""} 
                                                        <button type='button' className='rounded-full ml-1 border border-gray-400 w-fit py-[1px]' style={{ backgroundColor: fontColor }}>
                                                            <span className='px-8' style={{ color: fontColor }} onClick={() => setShowColorPicker('fontColor')} />
                                                        </button>
                                                    </label>
                                                )}
                                                {showColorPicker === 'fontColor' && (
                                                    <div 
                                                        className="absolute xxs:top-[18rem] xxs:left-[3rem] top-[16rem] left-[5.4rem] flex flex-col"
                                                        style={ selectedStyle !== 'default' && window.innerWidth <= 639 ? { top: '16rem' } 
                                                        : selectedStyle !== 'default' && window.innerWidth > 639 ? { top: '14rem' } : undefined }
                                                    >
                                                        <HexColorPicker color={fontColor} onChange={setFontColor} />
                                                        <button type='button' className='text-sm uppercase tracking-widest rounded-full mx-auto my-2 xxs:!mt-4'>
                                                            <span className='xxs:py-2 py-1 bg-black rounded-full px-10' onClick={() => setShowColorPicker('')}>
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
                                                    {!loader ? ("Create label"): (<SvgLoader options={{ showLoadingText: true }}/>)}
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
                                <p className='text-lg tracking-tight font-light'>Edit label</p>
                            </div>
                            <div className="flex flex-col px-6 space-y-3">
                                <p className='text-sm text-gray-400 !mb-4 uppercase tracking-widest'>First, select the type of the label</p>
                                <div className="flex">
                                    <input 
                                        type="radio" 
                                        name="radio-1" 
                                        className="radio !bg-gray-600 !border-gray-400" 
                                        onClick={() => setSelectedStyle('default')}
                                    />
                                    <div className="ml-6">
                                        <div className="badge badge-accent !py-3 uppercase text-xs tracking-widest" style={{ backgroundColor: color, borderColor: color, color: fontColor }}>
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
                                        <div className="badge badge-accent badge-outline !py-3 uppercase text-xs tracking-widest" style={{ borderColor: color, color: color }}>
                                            second style
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 !mb-0">
                                <p className='text-sm text-gray-400 !mb-4 uppercase tracking-widest px-6'>Now, enter the label details</p>
                                <div className="mt-2 flex flex-col space-y-4">
                                    <form noValidate onSubmit={handleSubmit(editLabel)}>
                                        <div className="px-6">
                                            <p className="text-red-500 ml-1 !mb-2 uppercase text-xs tracking-widest">
                                                {errors.editName?.message as string}
                                            </p>
                                            <input
                                                className={`sign-text-inputs bg-stone-900 text-gray-300 border-transparent active:border focus:border-gray-400 ${errors.name?.message && 'border border-red-600 focus:border-red-600 active:border-red-600'}`}
                                                placeholder="Name"
                                                {...register("editName", { required: "Name is required!" })}
                                            />   
                                            <div className="flex flex-col space-y-3 mt-5 !text-gray-400">
                                                <label className='text-xs uppercase tracking-widest'>
                                                    Pick a color: {""} 
                                                    <button type="button" className="rounded-full ml-1 border border-gray-400 w-fit py-[1px]" style={{ backgroundColor: color }}>
                                                        <span className='text-gray-900 px-8' onClick={() => setShowColorPicker('color')} style={{ color }} />
                                                    </button>
                                                </label>
                                                {showColorPicker === 'color' && (
                                                    <div 
                                                        className="absolute xxs:top-[16rem] xxs:left-[3rem] top-[14rem] left-[5.4rem] flex flex-col"
                                                        style={ selectedStyle === 'default' && window.innerWidth <= 639 ? { top: '18rem' } 
                                                        : selectedStyle === 'default' && window.innerWidth > 639 ? { top: '16rem' } : undefined }
                                                    >
                                                        <HexColorPicker color={color} onChange={setColor} />
                                                        <button type="button" className="text-sm uppercase tracking-widest rounded-full mx-auto my-2 xxs:!mt-4">
                                                            <span className='xxs:py-2 py-1 rounded-full px-10 bg-black text-gray-100' onClick={() => setShowColorPicker('')}>
                                                                close
                                                            </span>
                                                        </button>
                                                    </div>
                                                )}
                                                {selectedStyle === 'default' && (
                                                    <label className='text-xs uppercase tracking-widest'>
                                                        Pick a text color: {""} 
                                                        <button type="button" className='rounded-full ml-1 border border-gray-400 w-fit py-[1px]' style={{ backgroundColor: fontColor }}>
                                                            <span className="px-8" onClick={() => setShowColorPicker('fontColor')} style={{ color: fontColor }} />
                                                        </button>
                                                    </label>
                                                )}
                                                {showColorPicker === 'fontColor' && (
                                                    <div 
                                                        className="absolute xxs:top-[18rem] xxs:left-[3rem] top-[16rem] left-[5.4rem] flex flex-col"
                                                        style={ selectedStyle !== 'default' && window.innerWidth <= 639 ? { top: '16rem'} 
                                                        : selectedStyle !== 'default' && window.innerWidth > 639 ? { top: '14rem' } : undefined }
                                                    >
                                                        <HexColorPicker color={fontColor} onChange={setFontColor} />
                                                        <button className='text-sm uppercase tracking-widest rounded-full mx-auto my-2 xxs:!mt-4' type='button'>
                                                            <span className='xxs:py-2 py-1 bg-black rounded-full px-10' onClick={() => setShowColorPicker('')}>
                                                                close
                                                            </span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className='mt-5 text-gray-100 !px-0 border border-transparent border-t-gray-600 w-full flex justify-center items-center pt-3'>
                                            <button  type={loader ? 'button' : 'submit'} className='text-sm uppercase tracking-widest rounded-full px-8 pt-2 transition-all hover:text-[15px] duration-500'>
                                                {!loader ? ("Edit label"): (<SvgLoader options={{ showLoadingText: true }}/>)}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}   
                </>
            </Modal>
            <ConfirmationModal
                open={deleteModal}
                setOpen={setDeleteModal}
                deleteButtonAction={deleteLabel}
                mainText='Are you sure you want to delete this label?'
                options={{ loader, onClose: closeDeleteModal, modalWrapperClassName: "!w-96" }}
            />
        </>
    )
}