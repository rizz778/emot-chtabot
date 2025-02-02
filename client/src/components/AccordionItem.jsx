import React, { useState } from "react";
import AccordionItem from "./AccordionItem";

const Accordion = ({ items }) => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <dl className="faq">
      {items.map((item, index) => (
        <AccordionItem
          key={item.question} // ✅ Move the `key` prop here!
          showDescription={openIndex === index ? "show-description" : ""}
          ariaExpanded={openIndex === index}
          fontWeightBold={openIndex === index ? "font-weight-bold" : ""}
          item={item}
          index={index}
          onClick={() => setOpenIndex(openIndex === index ? null : index)}
        />
      ))}
    </dl>
  );
};

export default Accordion;
