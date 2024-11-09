import '../assets/css/header.css'

function Header() {
  return (
    <header className="w-full flex items-center gap-2">
      <div className='flex justify-center items-center'>
        <div className="circle-three"></div>
        <div className="ripple"></div>
        <div className="ripple"></div>
      </div>

      <h3>Crypto Currencies Live</h3>
  </header>
  )
}

export default Header