# Estia

## Creare una nuova versione

1. Rebasare il proprio branch di lavoro sul master e risolvere eventuali conflitti

 ```
 git rebase master
 ```

1. Mergiare le commit della modifica effettuata nel master usando l'opzione `--squash`

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

  Grazie al comando `preversion` contenuto nel `package.json`, questo comando assicura che venga fatto il build e vengano aggiunti i nuovi file allo stege di git.

  Questo comando crea inoltre un tag su git con la nuova versione.
