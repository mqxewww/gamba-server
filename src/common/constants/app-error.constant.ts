export interface AppResponseError<T> {
  name: T;
  message: string;
}

enum AppErrorName {
  EMAIL_ERROR = "EMAIL_ERROR",
  UNHANDLED_DATABASE_ERROR = "UNHANDLED_DATABASE_ERROR"
}

export const AppError: { [key in AppErrorName]: AppResponseError<AppErrorName> } = {
  [AppErrorName.EMAIL_ERROR]: {
    name: AppErrorName.EMAIL_ERROR,
    message: "An error occured while sending the email, please try again later."
  },
  [AppErrorName.UNHANDLED_DATABASE_ERROR]: {
    name: AppErrorName.UNHANDLED_DATABASE_ERROR,
    message: "An unhandled database error has occured, please try again now or later."
  }
};
