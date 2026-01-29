export const getResultCPM = (avgCpm: string) => {
  let result;
  if (avgCpm === "0 to 3€") {
    result = "Excellent";
  } else if (avgCpm === "3€ to 5€") {
    result = "Highly Above Average";
  } else if (avgCpm === "5€ to 9€") {
    result = "Above Average";
  } else if (avgCpm === "9€ to 12€") {
    result = "Average";
  } else if (avgCpm === ">12€") {
    result = "Low Average";
  } else {
    result = "Poor";
  }
  return result;
};
