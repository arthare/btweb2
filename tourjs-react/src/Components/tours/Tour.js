// src/tours/Tour.js

import { useState, useEffect } from "react";
import Joyride, { STATUS } from "react-joyride";
import steps from "./steps";

const joyrideStyles = {
  options: {
    zIndex: 10000,
    primaryColor: "#e74c3c",
    textColor: "#000000",
    tooltipColor: "#ffffff",
  },
  tooltip: {
    textAlign: "left",
    maxWidth: 300,
  },
  buttonNext: {
    backgroundColor: "#e74c3c",
  },
  buttonBack: {
    color: "#e74c3c",
  },
  buttonSkip: {
    color: "#e74c3c",
  },
  tooltipContainer: {
    textAlign: "start",
  },
};

const Tour = () => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Check if the tour has already been completed
    const tourCompleted = localStorage.getItem("tourCompleted");
    if (!tourCompleted) {
      setRun(true);
    }
  }, []);

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      // Save in local storage that the tour has been completed
      localStorage.setItem("tourCompleted", "true");
    }
  };

  return (
    <Joyride
      disableOverlayClose
      disableCloseOnEsc
      hideCloseButton
      steps={steps}
      run={run}
      continuous={true}
      showProgress={true}
      showSkipButton={true}
      callback={handleJoyrideCallback}
      styles={joyrideStyles}
    />
  );
};

export default Tour;
