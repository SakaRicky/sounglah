import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Footer, Header } from "./components";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import classes from './App.module.scss';
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Translation from "./features/translation/pages/Translation";
import TranslationManagement from "./features/translation/pages/TranslationManagement";
import { NotificationProvider } from '@/contexts/NotificationContext';

function App() {
	return (
		<NotificationProvider>
			<Router>
				<AuthProvider>
					<div className={classes.body}>
						<Header />
						
						<main className={classes.main}>
							<Routes>
								<Route path="/" element={<Landing />} />
								<Route path="/translate" element={<Translation />} />
								<Route path="/login" element={<Login />} />
								<Route 
									path="/admin" 
									element={
										<ProtectedRoute>
											<TranslationManagement />
										</ProtectedRoute>
									} 
								/>
							</Routes>
						</main>
						<Footer />
					</div>
				</AuthProvider>
			</Router>
		</NotificationProvider>
	);
}

export default App;