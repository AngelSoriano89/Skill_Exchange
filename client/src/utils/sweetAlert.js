import Swal from 'sweetalert2';

// Configuración base para SweetAlert2
const swalConfig = {
  customClass: {
    popup: 'sweet-alert-popup',
    title: 'sweet-alert-title',
    content: 'sweet-alert-content'
  },
  showClass: {
    popup: 'animate__animated animate__fadeInUp animate__faster'
  },
  hideClass: {
    popup: 'animate__animated animate__fadeOutDown animate__faster'
  }
};

// Alerta de éxito
export const showSuccessAlert = (title, text = '', options = {}) => {
  return Swal.fire({
    ...swalConfig,
    icon: 'success',
    title: title,
    text: text,
    timer: 3000,
    timerProgressBar: true,
    showConfirmButton: false,
    ...options
  });
};

// Alerta de error
export const showErrorAlert = (title, text = '', options = {}) => {
  return Swal.fire({
    ...swalConfig,
    icon: 'error',
    title: title,
    text: text,
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#d33',
    ...options
  });
};

// Alerta de advertencia
export const showWarningAlert = (title, text = '', options = {}) => {
  return Swal.fire({
    ...swalConfig,
    icon: 'warning',
    title: title,
    text: text,
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#f39c12',
    ...options
  });
};

// Alerta de información
export const showInfoAlert = (title, text = '', options = {}) => {
  return Swal.fire({
    ...swalConfig,
    icon: 'info',
    title: title,
    text: text,
    confirmButtonText: 'OK',
    confirmButtonColor: '#3085d6',
    ...options
  });
};

// Alerta de confirmación
export const showConfirmAlert = (title, text = '', options = {}) => {
  return Swal.fire({
    ...swalConfig,
    icon: 'question',
    title: title,
    text: text,
    showCancelButton: true,
    confirmButtonText: 'Sí',
    cancelButtonText: 'No',
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    ...options
  });
};

// Alerta de confirmación de eliminación
export const showDeleteConfirmAlert = (itemName = 'este elemento') => {
  return Swal.fire({
    ...swalConfig,
    icon: 'warning',
    title: '¿Estás seguro?',
    text: `¿Realmente deseas eliminar ${itemName}? Esta acción no se puede deshacer.`,
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    focusCancel: true
  });
};

// Alerta de carga (loading)
export const showLoadingAlert = (title = 'Procesando...', text = 'Por favor espera') => {
  return Swal.fire({
    ...swalConfig,
    title: title,
    text: text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

// Cerrar alerta de carga
export const closeLoadingAlert = () => {
  Swal.close();
};

// Mostrar errores de validación del servidor
export const showValidationErrors = (errors) => {
  if (Array.isArray(errors) && errors.length > 0) {
    const errorList = errors.map(error => `• ${error.msg || error.message || error}`).join('<br>');
    return Swal.fire({
      ...swalConfig,
      icon: 'error',
      title: 'Errores de validación',
      html: errorList,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#d33'
    });
  } else {
    return showErrorAlert('Error de validación', 'Por favor revisa los datos ingresados');
  }
};

// Manejar errores de la API
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        if (data.errors) {
          showValidationErrors(data.errors);
        } else {
          showErrorAlert('Datos inválidos', data.msg || 'Por favor revisa la información ingresada');
        }
        break;
      case 401:
        showErrorAlert('No autorizado', 'Tu sesión ha expirado. Por favor inicia sesión nuevamente');
        // Opcional: redirigir al login
        setTimeout(() => {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }, 2000);
        break;
      case 403:
        showErrorAlert('Acceso denegado', 'No tienes permisos para realizar esta acción');
        break;
      case 404:
        showErrorAlert('No encontrado', data.msg || 'El recurso solicitado no existe');
        break;
      case 409:
        showErrorAlert('Conflicto', data.msg || 'Ya existe un recurso con estos datos');
        break;
      case 500:
        showErrorAlert('Error del servidor', 'Ha ocurrido un error interno. Por favor intenta más tarde');
        break;
      default:
        showErrorAlert('Error', data.msg || 'Ha ocurrido un error inesperado');
    }
  } else if (error.request) {
    showErrorAlert(
      'Error de conexión', 
      'No se pudo conectar al servidor. Verifica tu conexión a internet'
    );
  } else {
    showErrorAlert('Error', error.message || 'Ha ocurrido un error inesperado');
  }
};

// Toast notifications (esquina superior derecha)
export const showSuccessToast = (message) => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });

  Toast.fire({
    icon: 'success',
    title: message
  });
};

export const showErrorToast = (message) => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });

  Toast.fire({
    icon: 'error',
    title: message
  });
};
