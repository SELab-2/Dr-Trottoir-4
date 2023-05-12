import {CloseButton, Modal} from "react-bootstrap";

function ImageEnlargeModal(
    {
        show,
        setShow,
        imageURL
    }: {
        show: boolean,
        setShow: (a: boolean) => void,
        imageURL: string
    }) {

    const handleClose = () => setShow(false);

    return <>
        <Modal show={show} onHide={handleClose} fullscreen={"xl-down"}>
            <div className={"bg-black"}
                 style={{maxHeight: "fit-content", maxWidth: "fit-content", position: "absolute", right: "0"}}>
                <CloseButton
                    variant={"white"}
                    onClick={handleClose}
                />
            </div>

            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <img src={imageURL} alt={imageURL}
                     style={{maxHeight: "100%", maxWidth: "100%", height: "70%", width: "auto"}}/>
            </div>
        </Modal>
    </>

}

export default ImageEnlargeModal;

