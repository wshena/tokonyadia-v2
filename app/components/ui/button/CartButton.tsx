import { CartIcon } from '../../icon'
import Button from './Button'

const CartButton = () => {
  return (
    <Button iconOnly icon={ <CartIcon size={25} color='black' /> } variant='icon' className='hidden md:block' />
  )
}

export default CartButton