import Modal from "react-bootstrap/Modal";

const DisplayInModal = (props) => {
  return (
    <Modal
      aria-labelledby="contained-modal-title-vcenter"
      backdrop="static"
      keyboard={false}
      show={props.show}
      onHide={props.onHide}
    >
      <Modal.Header closeButton className="text-center">
        <Modal.Title id="contained-modal-title-vcenter">
          {props.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>{props.content}</Modal.Body>
    </Modal>
  );
};

export default DisplayInModal;
