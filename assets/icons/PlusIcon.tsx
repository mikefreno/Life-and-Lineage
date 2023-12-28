import React from "react";
import Svg, { Path } from "react-native-svg";

const PlusIcon = ({ color = "#4ade80", ...props }) => (
  <Svg viewBox="0 0 448 512" {...props}>
    <Path
      d="M432 256C432 278.094 414.094 296 392 296H264V424C264 446.094 246.094 464 224 464S184 446.094 184 424V296H56C33.906 296 16 278.094 16 256S33.906 216 56 216H184V88C184 65.906 201.906 48 224 48S264 65.906 264 88V216H392C414.094 216 432 233.906 432 256Z"
      fill={color}
    />
  </Svg>
);

export default PlusIcon;
