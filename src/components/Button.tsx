import { buttonStyle } from "./styles";

interface ButtonProps {
  onClick: () => void;
  text: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ onClick, text, disabled }) => (
  <button
    type="button"
    className={buttonStyle}
    onClick={onClick}
    disabled={disabled}
  >
    {text}
  </button>
);

export default Button;
