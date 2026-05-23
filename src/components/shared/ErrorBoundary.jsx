import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Surface to console for the dev — the UI stays friendly.
    // eslint-disable-next-line no-console
    console.error('[arena]', error, info)
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      return (
        <div className="arena-card max-w-lg mx-auto mt-12 text-center p-8">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-accent-coral/20 grid place-items-center mb-4">
            <AlertTriangle className="text-accent-coral" />
          </div>
          <h2 className="font-display font-black text-arena-ink text-xl">Something tripped up.</h2>
          <p className="text-sm text-arena-muted mt-2">
            We hit an unexpected issue rendering this view. Try reloading — the rest of the Arena is still here.
          </p>
          <button
            onClick={this.reset}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-green text-arena-bg font-display font-bold text-sm shadow-glow"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
