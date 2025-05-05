interface AppResponseError {
  name: unknown;
  message: string;
}

enum AppErrorName {
  EMAIL_ERROR = "EMAIL_ERROR"
}

export const AppError: { [key in AppErrorName]: AppResponseError } = {
  [AppErrorName.EMAIL_ERROR]: {
    name: AppErrorName.EMAIL_ERROR,
    message: "An error occured while sending the email, please try again later."
  }
};
