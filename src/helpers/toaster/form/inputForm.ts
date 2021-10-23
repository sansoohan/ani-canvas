import moment from 'moment';
import Swal, { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content'

declare const window: any;

const MySwal = withReactContent(Swal)

const line: {[s: string]: (key: string, input: FormInputData) => string} = {
  file: (key: string, input: FormInputData) => {
    const column = input.column || [4, 8];
    return `
      <div class="form-group row mt-2">
        <span class="my-auto ms-auto col-${column[0]} text-end text-break">${input.label}</span>
        <div class="me-auto col-${column[1]}">
          <input
            id="swal-input-${key}"
            type="file"
            ${input?.fileType ? `accept=${input.fileType}` : ''}
            class="form-control me-auto col-${column[1]} text-start text-break"
            value="${input.value}"
            aria-describedby="swal-input-${key}-feedback"
            required
            onclick="this.classList.remove('is-invalid')"
            ${input?.disabled ? 'style="color:grey" disabled' : ''}
          />
          <div id="swal-input-${key}-feedback" class="invalid-feedback"></div>
        </div>
      </div>
    `
  },
  files: (key: string, input: FormInputData) => {
    const column = input.column || [4, 8];
    return `
      <div class="form-group row mt-2">
        <span class="my-auto ms-auto col-${column[0]} text-end text-break">${input.label}</span>
        <div class="me-auto col-${column[1]}">
          <input
            id="swal-input-${key}"
            type="file"
            ${input?.fileType ? `accept=${input.fileType}` : ''}
            class="form-control me-auto col-${column[1]} text-start text-break"
            value="${input.value}"
            ${input?.disabled ? 'style="color:grey" disabled' : ''}
            multiple
          />
        </div>
      </div>
    `
  },
  text: (key: string, input: FormInputData) => {
    const column = input.column || [4, 8];
    return `
      <div class="form-group row mt-2">
        <span class="my-auto ms-auto col-${column[0]} text-end text-break">${input.label}</span>
        <div class="me-auto col-${column[1]}">
          <input
            id="swal-input-${key}"
            type="text"
            class="form-control me-auto col-${column[1]} text-start text-break"
            value="${input.value}"
            aria-describedby="swal-input-${key}-feedback"
            required
            onclick="this.classList.remove('is-invalid')"
            ${input?.disabled ? 'style="color:grey" disabled' : ''}
          />    
          <div id="swal-input-${key}-feedback" class="invalid-feedback"></div>
        </div>
      </div>
    `
  },
  textarea: (key: string, input: FormInputData) => {
    const column = input.column || [4, 8];
    return `
      <div class="form-group row mt-2">
        <span class="my-auto ms-auto col-${column[0]} text-end text-break">${input.label}</span>
        <div class="me-auto col-${column[1]}">
          <textarea
            id="swal-input-${key}"
            type="textarea"
            rows="5"
            class="form-control text-start text-break"
            value="${input.value}"
            aria-describedby="swal-input-${key}-feedback"
            required
            onclick="this.classList.remove('is-invalid')"
            ${input?.disabled ? 'style="color:grey" disabled' : ''}
          ></textarea>
          <div id="swal-input-${key}-feedback" class="invalid-feedback"></div>
        </div>
      </div>
    `
  },
  password: (key: string, input: FormInputData) => {
    const column = input.column || [4, 8];
    return `
      <div class="form-group row mt-2">
        <span class="my-auto ms-auto col-${column[0]} text-end text-break">${input.label}</span>
        <div class="me-auto col-${column[1]}">
          <input
            id="swal-input-${key}"
            type="password"
            class="form-control text-start text-break"
            value="${input.value}"
            aria-describedby="swal-input-${key}-feedback"
            required
            onclick="this.classList.remove('is-invalid')"
            ${input?.disabled ? 'style="color:grey" disabled' : ''}
          />
          <div id="swal-input-${key}-feedback" class="invalid-feedback"></div>
        </div>
      </div>
    `
  },
  label: (key: string, input: FormInputData) => {
    const column = input.column || [4, 8];
    return `
      <div class="form-group row mt-2">
        <span class="my-auto ms-auto col-${column[0]} text-end text-break">${input.label}</span>
        <span
          id="swal-input-${key}"
          class="my-auto me-auto col-${column[1]} text-start text-break"
        >${input.value}</span>
      </div>
    `
  },
  link: (key: string, input: FormInputData) => {
    const column = input.column || [4, 8];
    return `
      <div class="form-group row mt-2">
        <span class="my-auto ms-auto col-${column[0]} text-end text-break">${input.label}</span>
        <a
          href="${input.value[0]}"
          id="swal-input-${key}"
          class="my-auto me-auto col-${column[1]} text-start text-break"
        >${input.value[1]}</a>
      </div>
    `
  },
  radio: (key: string, input: FormInputData) => {
    let radioString = '';
    for(const radio of input?.select || []) {
      radioString += `
        <div class="form-check d-flex flex-row">
          <input
            class="form-check-input"
            type="radio"
            name="swal-input-${key}"
            id="inlineRadio${radio.value}"
            value="${radio.value}"
            ${radio.value === input.value ? "checked" : ''}
            ${input?.disabled || radio?.disabled ? 'disabled' : ''}
          >
          <label class="form-check-label me-auto ms-1" for="inlineRadio${input.value}">${radio.label}</label>
        </div>
      `
    }

    const column = input.column || [4, 8];
    return `
      <div class="form-group row mt-2">
        <span class="my-auto ms-auto col-${column[0]} text-end text-break">${input.label}</span>
        <div
          id="swal-input-${key}"
          class="my-auto me-auto col-${column[1]} d-flex flex-column"
        >${radioString}</div>
      </div>
    `
  },
  check: (key: string, input: FormInputData) => {
    const column = input.column || [4, 8];
    return `
      <div class="form-group mt-2">
        <input
          class="form-check-input ms-auto col-${column[0]}"
          type="checkbox"
          value=""
          id="swal-input-${key}"
          ${input.value ? 'checked' : ''}
          ${input?.disabled ? 'style="color:grey" disabled' : ''}
        >
        <label class="form-check-label text-start text-break me-auto col-${column[1]}" for="swal-input-${key}">
          ${input.label}
        </label>
      </div>
    `
  },
  date: (key: string, input: FormInputData) => {
    setTimeout(() => {
      window.datepicker(`#swal-input-${key}`, {
        formatter: (output: any, date: Date, instance: any) => {
          output.value = moment(date).format("YYYY-MM-DD");
        },
        position: 'tr',
        customDays: ['日', '月', '火', '水', '木', '金', '土'],
        customMonths: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
        overlayButton: '確認',
        overlayPlaceholder: '4桁の数字',
      })
    }, 50);

    const column = input.column || [4, 8];
    return `
      <div class="form-group row mt-2">
        <span class="my-auto ms-auto col-${column[0]} text-end text-break">${input.label}</span>
        <div class="me-auto col-${column[1]}">
          <input
            id="swal-input-${key}"
            class="form-control"
            value="${moment(input.value).format("YYYY-MM-DD")}"
            readonly="readonly"
            aria-describedby="swal-input-${key}-feedback"
            required
            onclick="this.classList.remove('is-invalid')"
            ${input?.disabled ? 'style="color:grey" disabled' : ''}
          />
          <div id="swal-input-${key}-feedback" class="invalid-feedback"></div>
        </div>
      </div>
    `
  },
}

export type FormInputData = {
  label: string,
  value: any,
  disabled?: boolean,
  type?: string,
  select?: Array<SelectOption>,
  column?: Array<number>,
  fileType?: string,
  validations?: Array<(val: string) => Promise<string>>,
  canBeNull?: boolean,
}

export type SelectOption = {
  value: string,
  label: string,
  disabled?: boolean,
}

export default function inputForm(
  option: SweetAlertOptions<any, any>,
  inputMap: {[key: string]: FormInputData}
): Promise<SweetAlertResult<any>> {
  let inputLines = '';
  for (const key in inputMap) {
    const inputType: string = inputMap[key].type || 'text';
    const getLineInput = line[inputType];
    inputLines += getLineInput(key, inputMap[key]);
  }

  option.html= `
    <div class="row">
      ${inputLines}
    </div>
  `;

  option.preConfirm = () => new Promise(async (resolve) => {
    const callbacks: any = {}
    let hasError = false;

    for (const key in inputMap) {
      let result: any;
      const inputEl = document.getElementById(`swal-input-${key}`);
      if (!inputEl) {
        continue;
      }

      if (inputMap[key].type === 'file') {
        result = (inputEl as HTMLInputElement)?.files?.[0];
      } else if (inputMap[key].type === 'files') {
        const fileList = (document.getElementById(`swal-input-${key}`) as HTMLInputElement)?.files;
        const files: Array<File> = [];
        if (!fileList) {
          result = [];
          continue;
        }

        for (let i = 0; i < fileList.length || 0; i++) {
          files.push(fileList[i]);
        }

        result = files;
      } else if (inputMap[key].type === 'month') {
        const dateString = (inputEl as HTMLInputElement)?.value;
        result = Number(moment(dateString));
      } else if (inputMap[key].type === 'date') {
        const dateString = (inputEl as HTMLInputElement)?.value;
        result = Number(moment(dateString));
      } else if (inputMap[key].type === 'radio') {
        const radios = document.getElementsByName(`swal-input-${key}`) as NodeListOf<HTMLInputElement>
        radios.forEach((radio) => {
          if (radio.checked) {
            result = radio.value;
          }
        });
      } else if (inputMap[key].type === 'check') {
        result = (inputEl as HTMLInputElement)?.checked;
      } else {
        result = (inputEl as HTMLInputElement)?.value;
      }
      callbacks[key] = result;

      const inputError = document.getElementById(`swal-input-${key}-feedback`);
      if (!inputError) {
        continue;
      }

      if (
        !result
        && !inputMap[key].canBeNull
        && ['date', 'text', 'textarea', 'file', 'password'].includes(inputMap[key].type || 'text')
      ) {
        hasError = true;
        inputError.innerHTML = inputMap[key].type === 'file'
          ? 'ファイルを選択してください'
          : '入力してください';
        inputEl.classList.add('is-invalid');

        continue;
      }

      if (
        inputMap[key].validations
        && ['date', 'text', 'textarea', 'password'].includes(inputMap[key].type || 'text')
      ) {
        let errorMessages: Array<string> = [];

        for (const validationFunction
          of inputMap[key].validations as Array<(val: string) => Promise<string>>
        ) {
          const errorMessage = await validationFunction(result as string);
          if (errorMessage) {
            errorMessages.push(errorMessage);
          }
        }

        if (errorMessages.length > 0) {
          hasError = true;
          inputError.innerHTML = errorMessages.join('\n');
          inputEl.classList.add('is-invalid');

          continue;
        }
      }
    }

    if (hasError) {
      Swal.showValidationMessage('入力エラーがあります');
    }

    resolve(callbacks);
  });;

  if (option.showCloseButton === undefined) {
    option.showCloseButton = true;
  }
  if (option.showConfirmButton === undefined) {
    option.showConfirmButton = true;
  }
  if (option.showDenyButton === undefined) {
    option.showDenyButton = true;
  }

  option.confirmButtonText = option.confirmButtonText || 'Update';
  option.denyButtonText = option.denyButtonText || 'Cancel';

  return MySwal.fire(option);
}
