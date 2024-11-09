import '../src/assets/css/App.css'
import { useEffect, useState, useRef , useCallback } from 'react';
import Header from './components/Header'
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import axios from 'axios';
import { CryptoPair , KWatch } from './type';
import { Toast } from 'primereact/toast';
import SearchBar from './components/SearchBar';

function App() {
  const [cryptoPairs, setCryptoPairs] = useState< CryptoPair[]>([]);
  const [selectedCryptoPair, setSelectedCryptoPair] = useState<CryptoPair[]>([]);
  const [loading, setLoading] = useState('');
  const [searchCrypto, setSearchCrypto] = useState('');
  const [cryptoWatch , setCryptoWatch] = useState<KWatch[]>([])
  const toast = useRef<Toast>(null)
  const webSocket =useRef<WebSocket | null>(null)
  const showToast =(severity:'info'| 'warn' | 'success' | 'error',summary:string, detail:string) => {
      toast.current?.show({severity, summary, detail, life:3000})
  }

  const watchCryptoPair = useCallback((cryptoPair:CryptoPair) =>{
    webSocket.current = new WebSocket((`wss://stream.binance.com:9443/ws/${cryptoPair.symbol.toLowerCase() === 'usdt' ? 'usd' : cryptoPair.symbol.toLowerCase()}usdt@kline_1m`))
    webSocket.current.onmessage =(event) => {
      const data = JSON.parse(event.data)
      const updatedCrypto ={
        ...data,
        name:cryptoPair.name,
        id:cryptoPair.id,
        symbol:cryptoPair.symbol,
        logo:cryptoPair.logo
      }

      setCryptoWatch((prevWatch) => {
        const existing = prevWatch.find((item) => item.id === updatedCrypto.id)
        if(existing) {
          return prevWatch.map((item)=>item.id ===updatedCrypto.id ? updatedCrypto : item)
        }else{
          return[...prevWatch ,updatedCrypto]
        }
      })
    }

    webSocket.current.onerror = (error) => {
      console.error(error);
      showToast('error','Socket Error', 'Something Went Wrong...')
    }
    setSelectedCryptoPair([])
  },[])

  useEffect(() => {
    return () => {
      if (webSocket.current) {
        webSocket.current.close();
        webSocket.current = null;
      }
    };
  }, []);

  const useDebounceValue = (inputValue: string , delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(inputValue);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(inputValue);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [inputValue, delay]);
    return debouncedValue;
  };
  const debounceSearchCrypto = useDebounceValue(searchCrypto, 500);

  const onSearchCrypto = useCallback(async (value: string) => {
    setLoading('search');
    try {
      const response = await axios.get(`https://api.mobula.io/api/1/search?input=${value}`);
      setCryptoPairs(response.data.data);
    } catch (error) {
      console.error(error);
      showToast('error','Warning' , 'Something went wrong...')
    } finally {
      setLoading('');
    }
  },[]);

  const mockAddToWatchList = () => {
    setTimeout(() => {
      const isSuccess = Math.random() > .3
      if(isSuccess) {
        showToast('success','Added Successfully ', `${selectedCryptoPair.length} item was added to Watch List Successful`)
        selectedCryptoPair.forEach((cry) => watchCryptoPair(cry))
      }
        else showToast('error','Warning', 'Something Went Wrong please try again after a while')
    }, 500);
  }

  const fetchCryptoPairs = useCallback(async() => {
    setLoading('page');
    try {
      const response = await axios.get('https://api.mobula.io/api/1/all?fields=logo%2Cprice%2Cliquidity%2Cmarket_cap%2Cprice_change_1h%2Cprice_change_24h%2Cprice_change_7d%2Crank')
      if(response.data) setCryptoPairs(response.data.data.sort((a: CryptoPair , b: CryptoPair) => a.rank - b.rank))
    } catch (error) {
      console.error(error);
      showToast('error','fetch All Crypto', 'Something went wrong...')
    }finally{
      setLoading('')
    }
  },[])
  useEffect(() => {
    if (debounceSearchCrypto) {
      onSearchCrypto(debounceSearchCrypto);
    }else{
      fetchCryptoPairs()
    }
  }, [debounceSearchCrypto, fetchCryptoPairs , onSearchCrypto]);

  return (
    <>
    <Header />
      <section className="mt-10">
        <SearchBar
         loading={loading}
         selectedCryptoPair={selectedCryptoPair}
         setSelectedCryptoPair={setSelectedCryptoPair}
         setSearchCrypto={setSearchCrypto}
         mockAddToWatchList={mockAddToWatchList} 
        />
        <div
          className={`${loading === 'page' ? 'h-[400px] w-full flex justify-center items-center' : ''} mt-4`}
        >
          {loading === 'page' ? (
            <i className="pi pi-spin pi-spinner flex justify-center items-center" style={{ fontSize: '2.5rem' }}></i>
          ) : (
            <DataTable
              lazy
              scrollable
              scrollHeight="400px"
              className="mt-10"
              value={cryptoPairs}
              size="small"
              showGridlines
              stripedRows
              dataKey="id"
              virtualScrollerOptions={{ itemSize: 46 }}
              selection={selectedCryptoPair}
              selectionMode="multiple"
              onSelectionChange={(e) => setSelectedCryptoPair([...e.value])}
            >
               <Column selectionMode="multiple" className='bg-[#f5f5f5] w-4'></Column>
              <Column
                frozen
                className="w-80"
                field="logo"
                header="Name"
                body={(rowData) => (
                  <div className="flex items-center gap-1">
                    <img loading="lazy"  src={rowData.logo} alt={`${rowData.name} logo`} style={{ width: '20px', height: '20px' }} className="rounded-full" />
                    <span className='font-semibold text-sm'>{rowData.name}/USDT</span>
                  </div>
                )}
              />
              <Column field="symbol" className="w-80" header="Symbol"></Column>
              <Column
                header="Price"
                className="w-80"
                body={(rowData) => <span className='font-medium text-inherit'>{Number(rowData.price.toFixed(4)).toLocaleString()}</span>}
              />
              <Column header="Change-1H" className='w-80' body={(rowData) => <span className={`${rowData.price_change_1h > 0 ? 'text-green-500' : rowData.price_change_1h && rowData.price_change_1h < 0 ? 'text-red-500' : 'text-inherit' } text-lg font-semibold`}>{rowData.price_change_1h || '--'}</span>} />

              <Column header="Change-24H" className='w-80' body={(rowData) => <span className={`${rowData.price_change_24h > 0 ? 'text-green-500' : rowData.price_change_24h && rowData.price_change_24h < 0 ? 'text-red-500' : 'text-inherit'} text-lg font-semibold`}>{rowData.price_change_24h || '--'}</span>} />

              <Column header="Change-7D" className='w-80' body={(rowData) => <span className={`${rowData.price_change_7d > 0 ? 'text-green-500' : rowData.price_change_7d && rowData.price_change_7d < 0 ? 'text-red-500' : 'text-inherit'} text-lg font-semibold`}>{rowData.price_change_7d || '--'}</span>} />
            </DataTable>
          )}
        </div>
      </section>

      {
        cryptoWatch.length ? (
          <div className='mt-10'>
            <p className='mb-4'>Watch Interested Crypto</p>
            <DataTable value={cryptoWatch} size='small' showGridlines stripedRows dataKey="id">
            <Column
                frozen
                className="w-80"
                field="logo"
                header="Name"
                body={(rowData) => (
                  <div className="flex items-center gap-1">
                    <img loading="lazy"  src={rowData.logo} alt={`${rowData.name} logo`} style={{ width: '20px', height: '20px' }} className="rounded-full" />
                    <span className='font-semibold text-sm'>{rowData.name}/USDT</span>
                  </div>
                )}
              />
              <Column header="Symbol" field='symbol' className='w-80' />

              <Column header="Close" className='w-80' body={(rowData) => <span>{Number(rowData.k.c).toLocaleString()}</span>} />

              <Column header="Open" className='w-80' body={(rowData) => <span>
                {Number(rowData.k.o).toLocaleString()}
              </span>} />
              <Column header="High" className='w-80' body={(rowData) => <span>{Number(rowData.k.h).toLocaleString()}</span>} />

              <Column header="Low" className='w-80' body={(rowData) => <span>{Number(rowData.k.l).toLocaleString()}</span>} />

              <Column header="Volume" className='w-80' body={(rowData) => <span>{Number(rowData.k.v).toLocaleString()}</span>} />

            </DataTable>
          </div>
        ) : ( '')
      }
      <Toast ref={toast} position="bottom-left"  />
    </>
  );
}

export default App;
