# Tema Blockchain – Crowdfunding + Sponsorizare + Distributie (ERC-20)

Implementare DApp (partea smart contracts) care:
- vinde un token ERC-20 la pret fix (cumparare cu ETH),
- colecteaza contributii in token pana la o tinta (CrowdFunding),
- optional adauga sponsorizare procentuala (SponsorFunding),
- distribuie suma finala catre beneficiari/actionari pe baza ponderilor (DistributeFunding).

## Contracte
### 1) `MySaleToken` (ERC-20 + token sale)
- Contractul pre-minteaza supply mare pe adresa lui (`address(this)`).
- Owner seteaza pretul per token.
- Oricine poate cumpara tokeni cu `buyTokens(amountWholeTokens)` trimitand exact ETH-ul cerut.

### 2) `CrowdFunding`
Stari:
- `nefinantat`: se pot face `deposit(amount)` si `withdraw(amount)` (partial/total).
- `prefinantat`: s-a atins goal, nu se mai pot depune/retrage.
- `finantat`: dupa `finalizeAndRequestSponsor`, owner poate transfera tot la `DistributeFunding`.

### 3) `SponsorFunding`
- Are un procent fix (basis points) setat in constructor.
- Cand `CrowdFunding` finalizeaza, sponsor trimite bonusul doar daca are balanta suficienta.
- Owner poate cumpara tokeni pentru sponsorizari din `MySaleToken` prin `buySponsorTokens()`.

### 4) `DistributeFunding`
- Owner adauga actionari (adrese) cu ponderi (din 10_000 = 100%).
- Ponderea totala poate fi < 100% (restul ramane in contract si poate fi retras optional de owner).
- Dupa ce `CrowdFunding` transfera tokenii, doar contractul sursa (CrowdFunding) poate confirma `notifyFundingReceived()`.
- Fiecare actionar poate face `claim()` o singura data.

---

## Cerinte / dependinte

# (optional) foloseste Node LTS 22
nvm install 22.10.0
nvm use 22.10.0

# intra in proiect
cd proiect

# instaleaza dependintele
npm install

# compileaza contractele
npx hardhat compile

# ruleaza deploy + demo flow (retea locala simulata)
npx hardhat run scripts/deployAndDemo.js --network hardhat

