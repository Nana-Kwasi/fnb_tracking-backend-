import './Spinner.css'

const Spinner = ({ size = 'small' }) => {
  return (
    <span className={`spinner spinner-${size}`}></span>
  )
}

export default Spinner
