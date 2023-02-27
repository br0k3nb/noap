import { forwardRef, ReactElement, Ref } from 'react';
import Dialog, { DialogProps }  from '@mui/material/Dialog';
import DialogActions, { DialogActionsProps } from '@mui/material/DialogActions';
import DialogContent, { DialogContentProps } from '@mui/material/DialogContent';
import DialogTitle, { DialogTitleProps } from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import IconButton from '@mui/material/IconButton';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';

interface ModalTitle extends DialogTitleProps {
    closeBtn: () => void;
}  

export function DialogBody(props: DialogProps) {
    const {children, open, onClose, ...rest} = props;

    return (
        <Dialog
            {...rest}
         
            keepMounted
            fullWidth
            scroll="paper"
            open={open}
            TransitionComponent={Transition}
            onClose={onClose}
        >
            {children}
        </Dialog>
    );
};

export function TitleDialog(props: ModalTitle) {
    const {children, closeBtn, ...rest} = props;

    return (
        <DialogTitle {...rest}>
            {children}
            {closeBtn && (
                <CloseButton onClick={closeBtn}>
                    <CloseIcon style={{marginRight: 3}}/>
                </CloseButton>
            )}
        </DialogTitle>
    );
};

export function ContentDialog(props: DialogContentProps) {
    return (
        <DialogContent {...props} dividers>
            {props.children}
        </DialogContent>
    );
};

export function ActionsDialog(props: DialogActionsProps) {
    return (
        <DialogActions {...props}>
            {props.children}
        </DialogActions>
    );
};

const Transition = forwardRef(function Transition(
    props: TransitionProps & {
      children: ReactElement<any, any>;
    },
    ref: Ref<unknown>,
  ) {
    return <Slide direction="down" ref={ref} {...props} />;
});

const CloseButton = styled(IconButton)(({theme}) => ({
    position: 'absolute',
    right: 16,
    top: 12,
    color: theme.palette.grey[500],
}));