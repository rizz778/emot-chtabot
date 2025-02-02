import React, { useState } from "react";
import AccordionItem from "./AccordionItem";

const Accordion = ({ questionsAnswers }) => {
    const [activeIndex, setActiveIndex] = useState(1);
  
    // Ensure questionsAnswers is an array before using .map()
    if (!Array.isArray(questionsAnswers)) {
      return <div>Data is not available</div>;
    }
  
    const renderedQuestionsAnswers = questionsAnswers.map((item, index) => {
      const showDescription = index === activeIndex ? "show-description" : "";
      const fontWeightBold = index === activeIndex ? "font-weight-bold" : "";
      const ariaExpanded = index === activeIndex ? "true" : "false";
      return (
        <AccordionItem
          showDescription={showDescription}
          fontWeightBold={fontWeightBold}
          ariaExpanded={ariaExpanded}
          item={item}
          index={index}
          onClick={() => {
            setActiveIndex(index);
          }}
        />
      );
    });
  
    return (
      <div className="faq">
        <h1 className="faq__title">Frequently Asked Questions</h1>
        <dl className="faq__list">{renderedQuestionsAnswers}</dl>
      </div>
    );
  };
export default Accordion  