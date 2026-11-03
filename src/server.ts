import 'dotenv/config';
import { createApp } from './presentation/app.js';

const PORT = Number(process.env.PORT ?? 3000);
const app = createApp();

app.listen(PORT, () => {
  console.log(`Reservas Core API ejecutándose en http://localhost:${PORT}`);
});
