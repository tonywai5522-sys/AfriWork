const PROVIDER_ICONS = {
  google: 'G',
  github: 'GH',
  linkedin: 'in',
  microsoft: 'MS',
  apple: '',
  twitter: 'X',
}

const PROVIDER_COLORS = {
  google: 'bg-blue-100 text-blue-700 border-blue-300',
  github: 'bg-slate-100 text-slate-700 border-slate-300',
  linkedin: 'bg-blue-100 text-blue-800 border-blue-300',
  microsoft: 'bg-cyan-100 text-cyan-700 border-cyan-300',
  apple: 'bg-slate-100 text-slate-900 border-slate-300',
  twitter: 'bg-slate-100 text-slate-700 border-slate-300',
}

const ALL_PROVIDERS = [
  { id: 'google', name: 'Google' },
  { id: 'github', name: 'GitHub' },
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'microsoft', name: 'Microsoft' },
  { id: 'apple', name: 'Apple' },
  { id: 'twitter', name: 'Twitter' },
]

export default function ConnectedAccounts({ accounts, onConnect, onDisconnect, connecting }) {
  const connectedProviderIds = accounts.map(a => a.provider)

  function handleConnect(provider) {
    onConnect(provider)
  }

  return (
    <div>
      <h2 className="mb-6 text-lg font-bold text-slate-900">Connected Accounts</h2>
      <p className="mb-6 text-xs text-slate-500">Connect your accounts to enable single sign-on and import profile information</p>

      <div className="space-y-3">
        {ALL_PROVIDERS.map(provider => {
          const connected = accounts.find(a => a.provider === provider.id)
          const color = PROVIDER_COLORS[provider.id] || 'bg-slate-100 text-slate-600 border-slate-300'
          const icon = PROVIDER_ICONS[provider.id] || '?'

          return (
            <div
              key={provider.id}
              className="flex items-center justify-between rounded-xl border-2 border-slate-200 bg-white px-4 py-4"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 font-bold text-sm ${color}`}>
                  {icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{provider.name}</p>
                  {connected ? (
                    <p className="text-xs text-slate-500">
                      Connected as {connected.displayName || connected.providerEmail || connected.providerAccountId}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400">Not connected</p>
                  )}
                </div>
              </div>

              {connected ? (
                <button
                  onClick={() => onDisconnect(connected.id)}
                  className="shrink-0 rounded-xl border-2 border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 hover:border-red-400 hover:bg-red-50"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={() => handleConnect(provider.id)}
                  disabled={connecting}
                  className="shrink-0 rounded-xl border-2 border-slate-900 bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {connecting ? 'Connecting...' : 'Connect'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
