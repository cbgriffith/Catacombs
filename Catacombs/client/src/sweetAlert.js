import SweetAlert from "sweetalert2";
import "./sweetAlert.css";

const Swal = SweetAlert.mixin({
  theme: "borderless",
  background: "#212529",
  color: "#f8f9fa",
  buttonsStyling: false,
  customClass: {
    popup: "catacombs-alert",
    title: "catacombs-alert-title",
    htmlContainer: "catacombs-alert-content",
    actions: "catacombs-alert-actions",
    confirmButton:
      "catacombs-alert-button catacombs-alert-confirm",
    denyButton:
      "catacombs-alert-button catacombs-alert-deny",
    cancelButton:
      "catacombs-alert-button catacombs-alert-cancel",
  },
});

export default Swal;
