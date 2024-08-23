const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\-().&@?'#,/"'+]).*$/;
export const isValidPassword = (password: string) =>
  passwordRegex.test(password);
