import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = `${process.env.REACT_APP_BACKEND_URL}/api`

export default function WhatsAppPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState(null)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    setChecking(true)
    try {
      const response = await axios.get(`${API}/whatsapp/status`)
      setStatus(response.data)
    } catch (err) {
      console.error('Erro ao verificar status', err)
    } finally {
      setChecking(false)
    }
  }

  const handleConnect = async () => {
    if (!phone || phone.length < 10) {
      setError('Digite um número válido (mínimo 10 dígitos)')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const response = await axios.post(`${API}/whatsapp/pairing-code`, { phone })
      setCode(response.data.code)
      
      // Inicia verificação automática de status
      const interval = setInterval(async () => {
        try {
          const statusResponse = await axios.get(`${API}/whatsapp/status`)
          setStatus(statusResponse.data)
          
          if (statusResponse.data.connected) {
            clearInterval(interval)
          }
        } catch (err) {
          console.error('Erro ao verificar status', err)
        }
      }, 3000)

      // Limpa interval após 2 minutos
      setTimeout(() => clearInterval(interval), 120000)
    } catch (err) {
      const message = err.response?.data?.detail || 'Erro ao gerar código'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setCode(null)
    setPhone('')
    setError(null)
    checkStatus()
  }

  const formatPhone = (value) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    return numbers
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">ReVolta</h1>
            <p className="text-sm text-gray-600">Bem-vindo, {user?.name || user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-gray-700 hover:text-red-600 font-medium transition-colors"
            data-testid="logout-button"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Status Bar */}
        {status && (
          <div className={`mb-6 p-4 rounded-lg border-2 ${
            status.connected 
              ? 'bg-green-50 border-green-300' 
              : 'bg-yellow-50 border-yellow-300'
          }`} data-testid="status-bar">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  status.connected ? 'bg-green-500' : 'bg-yellow-500'
                } animate-pulse`}></div>
                <span className="font-medium">
                  {status.connected ? '✅ WhatsApp Conectado' : '⏳ WhatsApp Desconectado'}
                </span>
              </div>
              <button
                onClick={checkStatus}
                disabled={checking}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
                data-testid="refresh-status-button"
              >
                {checking ? 'Verificando...' : 'Atualizar'}
              </button>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Conectar WhatsApp</h2>
          <p className="text-gray-600 mb-8">
            Conecte seu WhatsApp usando código de pareamento
          </p>

          {!code ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Telefone (com código do país)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="5511999999999"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                  data-testid="phone-input"
                  disabled={loading}
                />
                <p className="mt-2 text-sm text-gray-500">
                  Exemplo: 5511999999999 (Brasil) ou 351912345678 (Portugal)
                </p>
              </div>

              <button
                onClick={handleConnect}
                disabled={loading || !phone}
                className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-medium text-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                data-testid="connect-button"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Gerando código...
                  </>
                ) : (
                  '📱 Conectar WhatsApp'
                )}
              </button>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" data-testid="error-message">
                  <strong>Erro:</strong> {error}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Código de Pareamento */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-500 rounded-xl p-8 text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Código de Pareamento
                </h3>
                <div className="text-7xl font-mono font-bold text-green-600 mb-4 tracking-wider" data-testid="pairing-code">
                  {code}
                </div>
                <div className="inline-block bg-yellow-100 border border-yellow-300 rounded-lg px-4 py-2 mb-4">
                  <p className="text-sm font-medium text-yellow-800">
                    ⏱️ Código expira em 60 segundos
                  </p>
                </div>
              </div>

              {/* Instruções */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  📝 Como usar o código:
                </h4>
                <ol className="space-y-2 text-sm text-gray-700">
                  <li className="flex gap-2">
                    <span className="font-bold text-green-600">1.</span>
                    <span>Abra o <strong>WhatsApp</strong> no seu celular</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-green-600">2.</span>
                    <span>Vá em <strong>Configurações → Aparelhos conectados</strong></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-green-600">3.</span>
                    <span>Toque em <strong>"Conectar um aparelho"</strong></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-green-600">4.</span>
                    <span>Toque em <strong>"Conectar com número de telefone"</strong></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-green-600">5.</span>
                    <span>Digite o <strong>código acima</strong></span>
                  </li>
                </ol>
              </div>

              {/* Status da Conexão */}
              {status && (
                <div className={`p-4 rounded-lg border-2 text-center ${
                  status.connected
                    ? 'bg-green-100 border-green-400'
                    : 'bg-gray-100 border-gray-300'
                }`} data-testid="connection-status">
                  {status.connected ? (
                    <div>
                      <p className="text-2xl mb-2">✅</p>
                      <p className="font-bold text-green-800">WhatsApp Conectado com Sucesso!</p>
                    </div>
                  ) : (
                    <div>
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mb-2"></div>
                      <p className="font-medium text-gray-700">Aguardando conexão...</p>
                    </div>
                  )}
                </div>
              )}

              {/* Botões */}
              <div className="flex gap-3">
                <button
                  onClick={checkStatus}
                  disabled={checking}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  data-testid="check-status-button"
                >
                  {checking ? 'Verificando...' : '🔄 Verificar Status'}
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  data-testid="reset-button"
                >
                  🔄 Nova Conexão
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-gray-800 mb-3">🛡️ Segurança</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Sua sessão é criptografada e segura</li>
              <li>• Nós não temos acesso às suas mensagens</li>
              <li>• Você pode desconectar a qualquer momento</li>
              <li>• Código expira automaticamente após 1 minuto</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
