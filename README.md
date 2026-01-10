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

pt frontend: 
npx hardhat run scripts/deploy.js --network sepolia
copiaza mysaletoken, sponsorFunding si DistributeFunding in adresses.local.json
apoi dai din folderul frontend npm run dev

1. Iti cumperi tokeni
2. Creezi un Contract punand adresa primita de crowdFunding si dai add
3. open si transferi <5 ca sa testezi si withdraw sau 5 pentru a arata finalitatea contractului
4. in Admin la fundingSource adresa de la CrowdFunding si la add shareHolder pui adresa de sus. Atentie 1000 e 10%. 100% e 10000
5. Dai finalaze&Request sponsor, apoi Transfer to Distribute si apoi claim
6. ai tokenii in cont
