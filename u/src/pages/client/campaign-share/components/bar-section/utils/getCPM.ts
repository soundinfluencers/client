export const getCPM = (cpm: number) => {
  let avgCpm;
  if (cpm < 3) {
    avgCpm = "0 to 3€";
  } else if (cpm < 5) {
    avgCpm = "3€ to 5€";
  } else if (cpm < 9) {
    avgCpm = "5€ to 9€";
  } else if (cpm < 12) {
    avgCpm = "9€ to 12€";
  } else {
    avgCpm = ">12€";
  }
  return avgCpm;
};
