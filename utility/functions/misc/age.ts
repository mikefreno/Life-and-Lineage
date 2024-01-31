export function generateBirthday(minAge: number, maxAge: number) {
  const today = new Date();
  const minDate = new Date();
  const maxDate = new Date();

  minDate.setFullYear(today.getFullYear() - maxAge - 1);
  minDate.setDate(minDate.getDate() + 1);
  maxDate.setFullYear(today.getFullYear() - minAge);

  const diff = maxDate.getTime() - minDate.getTime();
  const randomTimestamp = Math.random() * diff + minDate.getTime();

  return new Date(randomTimestamp).toISOString();
}

export function deathProbabilityByAge(age: number) {
  const a = 0.072;
  const b = 40;
  const probability = 1.0 / (1.0 + Math.exp(-a * (age - b)));
  return probability;
}

export function rollToLiveByAge(age: number) {
  const deathProbability = deathProbabilityByAge(age);
  const rollToLive = Math.ceil(deathProbability * 10) + 1;
  return rollToLive;
}

export function calculateAge(birthdate: Date, gameDate: Date) {
  let age = gameDate.getFullYear() - birthdate.getFullYear();
  const m = gameDate.getMonth() - birthdate.getMonth();

  if (m < 0 || (m === 0 && gameDate.getDate() < birthdate.getDate())) {
    age--;
  }

  return age;
}
