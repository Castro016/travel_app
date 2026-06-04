# TripWise Planner ✈️🗺️

**TripWise Planner** é um aplicativo mobile completo para planejamento e organização de viagens desenvolvido com **React Native**, **Expo (SDK 56)** e **TypeScript**. Com foco em uma experiência de usuário (UX) premium e design moderno, o app permite que você crie roteiros de viagem e gerencie de forma centralizada todos os deslocamentos, reservas gastronômicas, pontos turísticos e atividades diárias.

---

## ✨ Funcionalidades Principais

- **Planejador de Viagens**: Crie viagens definindo destino, título, datas (início e término) e uma descrição curta.
- **Identidade Visual Personalizável**: Escolha gradientes premium exclusivos (Airbnb e Notion style) para cada viagem.
- **Gerenciador de Transportes**: Adicione passagens de **avião, ônibus, trem, metrô, carro alugado e outros**, informando número de reserva, assento, código de confirmação, terminal, portão, empresa e notas.
- **Gastronomia & Restaurantes**: Salve restaurantes imperdíveis, cafés charmosos ou bares locais, incluindo data, hora da visita, endereço, detalhes da mesa/reserva e notas de degustação.
- **Pontos Turísticos & Atrações**: Guarde passeios, museus ou praias. Defina preço do ingresso e marque se o bilhete já foi adquirido (`🎟️ Ingresso Comprado` vs `❌ Não Comprado`).
- **Timeline de Roteiro Diário (Timeline Inteligente)**:
  - Navegue de forma interativa entre os dias da viagem através de um seletor horizontal (ex: *Dia 1*, *Dia 2*).
  - O app compila e **ordena automaticamente por horário** todos os transportes, visitas turísticas, restaurantes e atividades manuais criadas para aquele dia específico.
- **Confirmação & Feedbacks de Sucesso**: Modais elegantes de confirmação de exclusão de dados e modais animados de sucesso em cada operação para evitar erros acidentais.
- **Persistência Local**: Todos os dados são salvos localmente no dispositivo usando `@react-native-async-storage/async-storage`.

---

## 🛠️ Tecnologias Utilizadas

- **Framework**: [React Native](https://reactnative.dev/) & [Expo (Router)](https://docs.expo.dev/router/introduction/)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: Vanilla StyleSheet (Design premium, responsivo e limpo)
- **Persistência de Dados**: [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- **Gerenciamento de Formulários**: [React Hook Form](https://react-hook-form.com/)
- **Validação de Esquema**: [Zod](https://zod.dev/) (Integração via `@hookform/resolvers`)
- **Ícones**: [Lucide React Native](https://lucide.dev/)
- **Seleção de Datas & Horas**: [React Native Community DateTimePicker](https://github.com/react-native-datetimepicker/datetimepicker)

---

## 🚀 Instalação e Execução

### Pré-requisitos

1. **Node.js** instalado na máquina (versão LTS recomendada).
2. **Package Manager**: `npm` (já incluso no Node).
3. **Expo Go** (Opcional, para rodar no dispositivo físico): Instale o app *Expo Go* na Google Play Store (Android) ou App Store (iOS).

### Passo 1: Clonar e instalar as dependências

No terminal, navegue até a pasta do projeto e execute:

```bash
# Instalar dependências
npm install
```

### Passo 2: Iniciar o servidor de desenvolvimento do Expo

Inicie o bundler do Expo digitando:

```bash
# Iniciar o servidor de desenvolvimento
npx expo start
```

Isso abrirá a interface do Expo no terminal com um **QR Code**.

---

## 📱 Como Testar o Aplicativo

### 1. No dispositivo físico com Expo Go (Recomendado)

- **Android**: Abra o aplicativo **Expo Go** no celular e use a câmera ou a função de scanner de QR Code do app para ler o QR Code impresso no terminal.
- **iOS**: Abra a câmera nativa do iPhone, aponte para o QR Code do terminal e clique no link de abertura para abrir o projeto dentro do **Expo Go**.

> **Nota**: Certifique-se de que o computador onde o servidor de desenvolvimento está rodando e o seu celular estejam conectados na **mesma rede Wi-Fi**.

### 2. No Emulador Android

1. Abra o **Android Studio** e configure um dispositivo virtual Android (AVD) com a Google Play Store habilitada.
2. Inicie o emulador Android.
3. No terminal onde o Expo está rodando, pressione a tecla `a` ou execute diretamente:
   ```bash
   npm run android
   ```
   *O Expo irá baixar e instalar automaticamente o Expo Go no emulador e abrir o TripWise Planner.*

### 3. No Simulador iOS (Apenas macOS)

1. Instale o **Xcode** na App Store da Apple e configure as *Command Line Tools*.
2. Abra o simulador iOS.
3. No terminal onde o Expo está rodando, pressione a tecla `i` ou execute diretamente:
   ```bash
   npm run ios
   ```
   *O Expo irá abrir o projeto diretamente no simulador iOS configurado.*

---

## 📂 Estrutura de Pastas Profissional

```
travel_app/
├── app/                      # Rotas e Páginas do Expo Router
│   ├── _layout.tsx           # Configuração de rotas de navegação (Stack) e Providers
│   ├── index.tsx             # Dashboard principal (Lista de viagens, filtros e FAB)
│   ├── new-trip.tsx          # Cadastro de nova viagem (Zod Validation)
│   └── trip/
│       ├── [id].tsx          # Detalhes da viagem (Abas, Timeline e Contadores)
│       ├── add-transport.tsx # Cadastro de transportes (avião, trem, ônibus, etc)
│       ├── add-gastro.tsx    # Cadastro de gastronomia (cafés, restaurantes)
│       ├── add-attraction.tsx# Cadastro de pontos turísticos e ingressos
│       └── add-activity.tsx  # Cadastro de atividades manuais para a timeline
├── src/
│   ├── components/           # Componentes UI reutilizáveis
│   │   ├── Button.tsx        # Botão personalizado com variantes de estilo e loading
│   │   ├── Input.tsx         # Inputs de texto estilizados com exibição de erros Zod
│   │   ├── Select.tsx        # Seletor de categorias baseado em chips interativos
│   │   ├── TripCard.tsx      # Card premium de viagem com gradiente linear dinâmico
│   │   ├── Timeline.tsx      # Linha do tempo diária com agrupamento e ordenação horária
│   │   ├── SuccessModal.tsx  # Feedback animado de sucesso nas operações
│   │   └── DeleteConfirmModal.tsx # Proteção contra deleções acidentais
│   ├── hooks/
│   │   └── useTrips.tsx      # Contexto e Hook customizado para compartilhamento de estado
│   ├── services/
│   │   └── storage.ts        # Métodos CRUD integrados ao AsyncStorage local
│   ├── theme/
│   │   └── colors.ts         # Paleta de cores premium (Notion & Airbnb Style)
│   └── utils/
│       └── date.ts           # Formatadores de data e contadores de dias em português
└── package.json              # Dependências e scripts do projeto
```

---

## 🧪 Validação & Tipo de Dados

O projeto conta com validação estrita em TypeScript e validação de schema em tempo de execução via **Zod**:
- Ao criar uma viagem, o Zod valida que a data de término não pode ser menor que a data de início (`endDate >= startDate`).
- Ao cadastrar transportes, pontos turísticos, restaurantes e atividades, os formulários são monitorados pelo `react-hook-form`, indicando visualmente erros em vermelho caso o usuário tente submeter dados incompletos ou em formatos incorretos.


