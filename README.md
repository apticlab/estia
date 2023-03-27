# Estia

## Creare una nuova versione

1. Rebasare il proprio branch di lavoro sul master e risolvere eventuali conflitti

 ```
 git rebase master
 ```
2. Builda la nuova versione facendo partire il container di docker che si occuperà in autonomia di tutto il processo di build `docker-compose up -d --build`. Questo comando creerà i nuovi file di build.

3. Commita i nuovi file di build con `git commit -m "new build files"`

4. Mergiare le commit della modifica effettuata nel master usando l'opzione `--squash`

 ```
 git checkout master
 git merge --squash <working-branch>
 ```

 1. Aggiornare la versione tenendo conto dell'importanza delle modifiche:
  1. Bugfix => patch
  1. Introduzione nuova feature, mantenendo vecchia compatibilità => minor
  1. Cambio radicale (o nuovo set di features esteso) senza garanzia di mantenimento compatibilità => major

  ```
  npm version {patch|minor|major} --force
  ```
  Questo comando crea inoltre un tag su git con la nuova versione.
