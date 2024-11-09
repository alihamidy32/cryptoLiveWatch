import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Button } from 'primereact/button';
import { CryptoPair } from '../type';
import React from 'react';

interface SearchBarProps {
  loading: string;
  selectedCryptoPair: CryptoPair[];
  setSelectedCryptoPair: React.Dispatch<React.SetStateAction<CryptoPair[]>>;
  setSearchCrypto: React.Dispatch<React.SetStateAction<string>>;
  mockAddToWatchList: () => void;
}
const SearchBar :React.FC<SearchBarProps> =({loading,selectedCryptoPair,mockAddToWatchList,setSearchCrypto,setSelectedCryptoPair}) => {
  return (
    <>
    <h4>crypto pair table</h4>

    <div className='flex justify-between items-center'>
      <IconField iconPosition="left" className="mt-2 w-1/3 rounded-lg">
        {loading === 'search' ? (
        <InputIcon className="pi pi-spin pi-spinner text-inherit" />
        ) : (
        <InputIcon className="pi pi-search text-inherit" />
        )}
        <InputText
        placeholder="Search your interested crypto..."
        className="px-8 py-2 w-full bg-zinc-100 input text-sm"
        onChange={(e) => setSearchCrypto(e.target.value)}
        />
      </IconField>

      { selectedCryptoPair && selectedCryptoPair.length ?
        (
          <div className='flex gap-2 items-center'>
            <Button className='bg-green-500 px-3 py-2 rounded-md font-thin text-white text-sm' label={`watch ${selectedCryptoPair.length} crypto`} onClick={() => mockAddToWatchList()}/>

            <Button label='cancel' className='bg-red-500 px-3 py-2 rounded-md font-thin text-white text-sm' onClick={() => setSelectedCryptoPair([])} />
          </div> 
        ) : ''
      }
    </div>
    </>
  )
}

export default SearchBar