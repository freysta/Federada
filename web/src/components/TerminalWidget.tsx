import { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2 } from 'lucide-react';
import { API_URL } from '../config';

export default function TerminalWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [history, setHistory] = useState<string[]>(['Bem-vindo ao Terminal Federada v1.0. Digite "ajuda" para começar.']);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, isOpen]);

  const handleCommand = async (cmd: string) => {
    const parts = cmd.trim().split(' ');
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    let response = '';

    switch (commandName) {
      case 'help':
      case 'ajuda':
        response = 'Comandos: help, status <id>, about, merch, contact, clear, date, exit';
        break;
      case 'status':
        if (args.length === 0) {
          response = 'Uso: status <id_do_pedido>';
        } else {
          const orderId = args[0];
          setHistory(prev => [...prev, `> ${cmd}`, 'FETCHING_ORDER_DATA...']);
          try {
            const res = await fetch(`${API_URL}/orders/${orderId}`);
            if (!res.ok) throw new Error();
            const order = await res.json();
            
            setHistory(prev => [...prev, 
              `--- PEDIDO: ${order.id.slice(0,8)}... ---`,
              `> PRODUTO: ${order.productName}`,
              `> TAMANHO: ${order.productSize || 'N/A'}`,
              `> STATUS: ${order.status}`,
              `> DATA: ${new Date(order.createdAt).toLocaleDateString()}`,
              `-------------------------`
            ]);
            return;
          } catch (err) {
            response = `ERROR: Pedido ${orderId} não encontrado ou servidor offline.`;
          }
        }
        break;
      case 'about':
        response = 'Federada: Otimizando a experiência acadêmica desde 2024.';
        window.location.hash = '#about';
        break;
      case 'merch':
        response = 'Acessando Loja Oficial...';
        window.location.hash = '#merch';
        break;
      case 'contact':
        response = 'Instagram: @federadaifro';
        break;
      case 'dev':
      case 'credits':
      case 'autor':
        response = 'ACCESS GRANTED: Exibindo contato do desenvolvedor...';
        setTimeout(() => {
          setHistory(prev => [...prev, 
            '--- SYSTEM CREATOR ---',
            '> IAD TECH',
            '> SOFTWARE STUDIO',
            '> STATUS: ONLINE',
            '> CONTATO: Abrindo canal seguro...'
          ]);
          window.open('https://wa.me/5569993242656', '_blank');
        }, 500);
        break;
      case 'clear':
        setHistory([]);
        return;
      case 'date':
        response = new Date().toLocaleTimeString();
        break;
      case 'exit':
        setIsOpen(false);
        return;
      default:
        response = `Comando desconhecido: ${commandName}. Digite "help".`;
    }

    setHistory(prev => [...prev, `> ${cmd}`, response]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-black text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform z-50 border border-white/20"
      >
        <TerminalIcon size={24} />
      </button>
    );
  }

  return (
    <div className={`fixed right-0 md:right-6 bg-black/95 text-green-500 font-mono text-sm border border-green-900 shadow-2xl z-50 transition-all duration-300 flex flex-col ${isMinimized ? 'bottom-6 w-64 h-12 rounded-l-lg md:rounded-lg' : 'bottom-0 md:bottom-6 w-full md:w-96 h-[50vh] md:h-80 rounded-t-lg md:rounded-lg'}`}>
      
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-neutral-900 border-b border-green-900/50">
        <span className="text-xs text-gray-400">root@federada:~</span>
        <div className="flex gap-2">
            <button onClick={() => setIsMinimized(!isMinimized)} className="hover:text-white">
                {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            </button>
            <button onClick={() => setIsOpen(false)} className="hover:text-red-500">
                <X size={14} />
            </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="flex-1 p-4 overflow-y-auto" onClick={() => inputRef.current?.focus()}>
            {history.map((line, i) => (
                <div key={i} className="mb-1 break-words">{line}</div>
            ))}
            <div className="flex gap-2 mt-2">
                <span>$</span>
                <input 
                    ref={inputRef}
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent outline-none border-none text-green-500 focus:ring-0 p-0"
                    autoFocus
                />
            </div>
            <div ref={bottomRef}></div>
        </div>
      )}
    </div>
  );
}
            
            setHistory(prev => [...prev, 
              `--- PEDIDO: ${order.id.slice(0,8)}... ---`,
              `> PRODUTO: ${order.productName}`,
              `> TAMANHO: ${order.productSize || 'N/A'}`,
              `> STATUS: ${order.status}`,
              `> DATA: ${new Date(order.createdAt).toLocaleDateString()}`,
              `-------------------------`
            ]);
            return;
          } catch (err) {
            response = `ERROR: Pedido ${orderId} não encontrado ou servidor offline.`;
          }
        }
        break;
      case 'about':
        response = 'Federada: Otimizando a experiência acadêmica desde 2024.';
        window.location.hash = '#about';
        break;
      case 'merch':
        response = 'Acessando Loja Oficial...';
        window.location.hash = '#merch';
        break;
      case 'contact':
        response = 'Instagram: @federadaifro';
        break;
      case 'dev':
      case 'credits':
      case 'autor':
        response = 'ACCESS GRANTED: Exibindo contato do desenvolvedor...';
        setTimeout(() => {
          setHistory(prev => [...prev, 
            '--- SYSTEM CREATOR ---',
            '> IAD TECH',
            '> SOFTWARE STUDIO',
            '> STATUS: ONLINE',
            '> CONTATO: Abrindo canal seguro...'
          ]);
          window.open('https://wa.me/5569993242656', '_blank');
        }, 500);
        break;
      case 'clear':
        setHistory([]);
        return;
      case 'date':
        response = new Date().toLocaleTimeString();
        break;
      case 'exit':
        setIsOpen(false);
        return;
      default:
        response = `Comando desconhecido: ${commandName}. Digite "help".`;
    }

    setHistory(prev => [...prev, `> ${cmd}`, response]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-black text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform z-50 border border-white/20"
      >
        <TerminalIcon size={24} />
      </button>
    );
  }

  return (
    <div className={`fixed right-0 md:right-6 bg-black/95 text-green-500 font-mono text-sm border border-green-900 shadow-2xl z-50 transition-all duration-300 flex flex-col ${isMinimized ? 'bottom-6 w-64 h-12 rounded-l-lg md:rounded-lg' : 'bottom-0 md:bottom-6 w-full md:w-96 h-[50vh] md:h-80 rounded-t-lg md:rounded-lg'}`}>
      
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-neutral-900 border-b border-green-900/50">
        <span className="text-xs text-gray-400">root@federada:~</span>
        <div className="flex gap-2">
            <button onClick={() => setIsMinimized(!isMinimized)} className="hover:text-white">
                {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            </button>
            <button onClick={() => setIsOpen(false)} className="hover:text-red-500">
                <X size={14} />
            </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="flex-1 p-4 overflow-y-auto" onClick={() => inputRef.current?.focus()}>
            {history.map((line, i) => (
                <div key={i} className="mb-1 break-words">{line}</div>
            ))}
            <div className="flex gap-2 mt-2">
                <span>$</span>
                <input 
                    ref={inputRef}
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent outline-none border-none text-green-500 focus:ring-0 p-0"
                    autoFocus
                />
            </div>
            <div ref={bottomRef}></div>
        </div>
      )}
    </div>
  );
}
