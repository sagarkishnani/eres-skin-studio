const underlineBase =
  "bg-[length:0%_1px] bg-right-bottom bg-no-repeat [background-image:linear-gradient(currentColor,currentColor)] transition-[background-size] ease-out-expo motion-reduce:transition-none";

export const hoverUnderline = `${underlineBase} duration-500 hover:bg-[length:100%_1px] hover:bg-left-bottom focus-visible:bg-[length:100%_1px] focus-visible:bg-left-bottom`;

export const groupHoverUnderline = `${underlineBase} group-hover:bg-[length:100%_1px] group-hover:bg-left-bottom group-focus-visible:bg-[length:100%_1px] group-focus-visible:bg-left-bottom`;
