import Swal, { SweetAlertOptions } from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

export default function showSuccess(option: SweetAlertOptions<any, any>): void {
  option.icon = 'success';
  option.backdrop = `rgba(0,0,0,0)`;
  option.showConfirmButton = option.showConfirmButton ?? false;
  MySwal.fire(option);
}
