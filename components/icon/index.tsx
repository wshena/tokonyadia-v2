import { 
  FaStar,
  FaAngleLeft, 
  FaAngleRight,
  FaRegEye,
  FaRegEyeSlash,
  FaArrowUp,
  FaPinterest,
  FaInstagram,
  FaTwitter,
  FaFacebook,
  FaRegStar,
  FaRegHeart,
  FaMinus,
  FaPlus,
  FaPenAlt
} from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { AiOutlineMenuFold } from "react-icons/ai";
import { MdOutlineCancel } from "react-icons/md";
import { GoPersonFill } from "react-icons/go";
import { FaRegTrashCan, FaHeart } from "react-icons/fa6";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { HiOutlineEllipsisHorizontal } from "react-icons/hi2";

export const CategoryIcon = ({size, color, className}: IconProps) => {
  return <BiSolidCategoryAlt size={size} color={color} className={className} />
}

export const OptionIcon = ({size, color, className}: IconProps) => {
  return <HiOutlineEllipsisHorizontal size={size} color={color} className={className} />
}

export const AngleLeftIcon = (props: IconProps) => <FaAngleLeft {...props} />;
export const AngleRightIcon = (props: IconProps) => <FaAngleRight {...props} />;
export const StartIcon = (props: IconProps) => <FaStar {...props} />

export const PenIcon = ({size, color, className}:IconProps) => {
  return (
    <FaPenAlt size={size} color={color} className={className} />
  )
}

export const TrashIcon = ({size, color, className}:IconProps) => {
  return (
    <FaRegTrashCan size={size} color={color} className={className} />
  )
}

export const MinusIcon = ({size, color, className}:IconProps) => {
  return (
    <FaMinus size={size} color={color} className={className} />
  )
}

export const PlusIcon = ({size, color, className}:IconProps) => {
  return (
    <FaPlus size={size} color={color} className={className} />
  )
}

export const FullHeartIcon = ({size, color, className}:IconProps) => {
  return (
    <FaHeart size={size} color={color} className={className} />
  )
}

export const HeartIcon = ({size, color, className}:IconProps) => {
  return (
    <FaRegHeart size={size} color={color} className={className} />
  )
}

export const StarIcon = ({size, color, className}:IconProps) => {
  return (
    <FaRegStar size={size} color={color} className={className} />
  )
}

export const PinterestIcon = ({size, color, className}:IconProps) => {
  return (
    <FaPinterest size={size} color={color} className={className} />
  )
}

export const InstagramIcon = ({size, color, className}:IconProps) => {
  return (
    <FaInstagram size={size} color={color} className={className} />
  )
}

export const TwitterIcon = ({size, color, className}:IconProps) => {
  return (
    <FaTwitter size={size} color={color} className={className} />
  )
}

export const FacebookIcon = ({size, color, className}:IconProps) => {
  return (
    <FaFacebook size={size} color={color} className={className} />
  )
}

export const AvatarIcon = ({size, color, className}: IconProps) => {
  return <GoPersonFill size={size} color={color} className={className} />
}

export const ArrowUpIcon = ({size, color, className}: IconProps) => {
  return <FaArrowUp size={size} color={color} className={className} />
}

export const CancelIcon = ({size, color, className}: IconProps) => {
  return <MdOutlineCancel size={size} color={color} className={className} />
}

export const MenuIcon = ({size, color, className}: IconProps) => {
  return <AiOutlineMenuFold size={size} color={color} className={className} />
}

export const SearchIcon = ({size, color, className}: IconProps) => {
  return <HiMagnifyingGlass size={size} color={color} className={className} />
}

export const GoogleIcon = ({size, color, className}: IconProps) => {
  return <FcGoogle size={size} color={color} className={className} />
}

export const EyeSlashIcon = ({size, color, className}: IconProps) => {
  return <FaRegEyeSlash size={size} color={color} className={className} />
}

export const EyeIcon = ({size, color, className}: IconProps) => {
  return <FaRegEye size={size} color={color} className={className} />
}

export const LeftAngleIcon = ({size, color, className}: IconProps) => {
  return <FaAngleLeft size={size} color={color} className={className} />
}

export const RightAngleIcon = ({size, color, className}: IconProps) => {
  return <FaAngleRight size={size} color={color} className={className} />
}

export const CartIcon = ({size, color, className}: IconProps) => {
  return <IoCartOutline size={size} color={color} className={className} />
}
