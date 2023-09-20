import { SetStateAction, Dispatch, useState } from 'react';
import { useForm, FieldArrayWithId } from 'react-hook-form';

import useLabel from '../../../../../hooks/useLabel';

import ListLabels from './ListLabels';
import CreateLabel from './CreateLabels';
import EditLabel from './EditLabels';

import Modal from '../../../../../components/Modal';
import { toastAlert } from '../../../../../components/Alert';
import ConfirmationModal from '../../../../../components/ConfirmationModal';

import api from '../../../../../services/api';

type Props = {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    userId: string;
    labels: FieldArrayWithId<Labels, "labels", "id">[];
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

export default function LabelModal({ open, setOpen, userId, labels }: Props) {
    const [loader, setLoader] = useState(false);
    const [color, setColor] = useState("#0e63b9");
    const [fontColor, setFontColor] = useState("#ffffff");
    const [deleteModal, setDeleteModal] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [showSearchBar, setShowSearchBar] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState('');
    const [showGoBackButton, setShowGoBackButton] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
    const [goBackButtonAction, setGoBackButtonAction] = useState<any>({action: null});
    const [selectedStyle, setSelectedStyle] = useState<"default" | "outlined">("default");
    const [labelModalStatus, setLabelModalStatus] = useState<"create" | "edit" | "list">("list");

    const { handleSubmit, register, formState, reset } = useForm<Label>();
    const { errors } = formState;

    const {
        fetchLabels,
        removeLabels,
        dispatchLabels
    } = useLabel();

    const onAddNewLabelClick = () => {
        setLabelModalStatus("create");
        setShowGoBackButton(true);
        setGoBackButtonAction({
            action: () => {
                setLabelModalStatus("list");
                setGoBackButtonAction({ action: null })
            }
        });
    };

    const closeModal = () => {
        setOpen(false);
        dispatchLabels({
            type: "PAGE_AND_SEARCH",
            payload: {
                search: "",
                page: 1
            }
        });
        setShowSearchBar(false);
        setTimeout(() => setLabelModalStatus("list"), 500);
    };
    
    const openDeleteModal = (_id: string) => {
        setSelectedLabel(_id);
        setDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setDeleteModal(false);
        setSelectedLabel(null);
    };
        
    const deleteLabel = async () => {
        setLoader(true);
        
        if(!selectedLabel) {
            setLoader(false);
            return toastAlert({ icon: 'error', title: `Please, select a label to delete`, timer: 3000 });
        }
        
        try {
            await api.delete(`/label/delete/${selectedLabel}`);
            toastAlert({ icon: 'success', title: "Label deleted!", timer: 3000 });
            setLoader(false);
            closeDeleteModal();
            
            const findLabel = labels.find(({_id}) => _id === selectedLabel);
            if(removeLabels) removeLabels(labels.indexOf(findLabel as any));
            if(fetchLabels) fetchLabels();
        } catch (err: any) {
            setLoader(false);
            toastAlert({ icon: 'error', title: `${err.message}`, timer: 3000 });
        }
    };

    const resetLabelInfoToEdit = (label: FieldArrayWithId<Labels, "labels", "id">) => {
        const { _id, name, color, fontColor }: any = labels?.find(({_id}) => _id === label._id);
        
        reset({ editName: name });
        setEditId(_id);
        setColor(color);
        setSelectedStyle('default');
        setFontColor(fontColor);
        setLabelModalStatus('edit');
        setShowGoBackButton(true);
        setGoBackButtonAction({
            action: () => {
                setLabelModalStatus("list");
                setGoBackButtonAction({action: null})
            }
        });
    };

    const modalProps = {
        open,
        setOpen,
        title: 'Labels',
        options: {
            onClose: closeModal,
            showGoBackButton: showGoBackButton,
            goBackButtonAction: goBackButtonAction.action,
            titleWrapperClassName: "px-6",
            modalWrapperClassName: `xxs:!w-[18rem] !px-0 !w-[23rem] max-h-[33.2rem] overflow-hidden`
        }
    };

    return (
        <>
            <Modal {...modalProps}>
                <>
                    {labelModalStatus === "list" ? (
                        <ListLabels
                            labels={labels}
                            onAddNewLabelClick={onAddNewLabelClick}
                            openDeleteModal={openDeleteModal}
                            resetLabelInfoToEdit={resetLabelInfoToEdit}
                            setShowSearchBar={setShowSearchBar}
                            showSearchBar={showSearchBar}
                        />
                    ) : labelModalStatus === 'create' ? (
                        <CreateLabel
                            color={color}
                            errors={errors}
                            fontColor={fontColor}
                            handleSubmit={handleSubmit}
                            loader={loader}
                            register={register}
                            selectedStyle={selectedStyle}
                            setShowColorPicker={setShowColorPicker}
                            setColor={setColor}
                            setFontColor={setFontColor}
                            setLoader={setLoader}
                            setSelectedStyle={setSelectedStyle}
                            showColorPicker={showColorPicker}
                        />
                    ) : (
                        <EditLabel
                            color={color}
                            errors={errors}
                            fontColor={fontColor}
                            handleSubmit={handleSubmit}
                            loader={loader}
                            register={register}
                            selectedStyle={selectedStyle}
                            setShowColorPicker={setShowColorPicker}
                            setColor={setColor}
                            setFontColor={setFontColor}
                            setLoader={setLoader}
                            setSelectedStyle={setSelectedStyle}
                            showColorPicker={showColorPicker}
                            editId={editId}
                        />
                    )}   
                </>
            </Modal>
            <ConfirmationModal
                open={deleteModal}
                setOpen={setDeleteModal}
                actionButtonFn={deleteLabel}
                mainText='Are you sure you want to delete this label?'
                options={{
                    loader,
                    onClose: closeDeleteModal,
                    modalWrapperClassName: "!w-96 xxs:!w-80",
                    mainTextClassName: "xxs:text-xs"
                }}
            />
        </>
    )
}