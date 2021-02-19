<?php
  include('../conf/db_connection.php');
  $response = new stdClass();
  if (isset($_POST['create_expense_head']) &&  isset($_POST['description'])) {
    $Name        = html_entity_decode(mysqli_real_escape_string($con, $_POST['create_expense_head']));
    $Description = html_entity_decode(mysqli_real_escape_string($con, $_POST['description']));

    if (strlen($Name) == 0 || strlen($Description) == 0) {
      $response->error = true;
      $response->message = 'Missing params';
    } else {
      $CheckIfExists = mysqli_query($con, "SELECT * FROM cashbook_expense_heads WHERE name='".$Name."' ");
      if (mysqli_num_rows($CheckIfExists) == 0) {
        $AddNew = mysqli_query($con, "INSERT INTO cashbook_expense_heads(name,description) VALUES('".$Name."','".$Description."') ");
        if ($AddNew) {
          $response->error = false;
          $response->message = 'Success';
        } else {
          $response->error = true;
          $response->message = 'Something went wrong. Entry was not added';
        }
      } else {
        $response->error = true;
        $response->message = 'Sorry, '.$Name.' already exists';
      }
    }

  } else if(isset($_POST['get_expense_heads'])) {
    $ExpenseHeadsArray = array();
    $AllExpenseheads = mysqli_query($con, "SELECT * FROM cashbook_expense_heads ORDER BY name ASC");
    while($Expense   = mysqli_fetch_array($AllExpenseheads)) {
      $Entry = new stdClass();
      $Entry->id = $Expense[id];
      $Entry->name = (String)$Expense[name];
      $Entry->description = (String)$Expense[description];

      array_push($ExpenseHeadsArray, $Entry);
    }

    $response->data = $ExpenseHeadsArray;
  
  } else if(isset($_POST['delete_expense_head'])) {
    $expenseHeadId = html_entity_decode(mysqli_real_escape_string($con, $_POST['delete_expense_head']));
    $HasExpense    = mysqli_query($con, "SELECT * FROM cashbook_expense_accounts WHERE expense_head_id=".$expenseHeadId." ");

    if(mysqli_num_rows($HasExpense) == 0) {
      $DropHead    = mysqli_query($con, "DELETE FROM cashbook_expense_heads WHERE id=".$expenseHeadId." LIMIT 1");
      if($DropHead) {
        $response->error = false;
        $response->message = 'Success';
      } else {
        $response->error = true;
        $response->message = 'Something went wrong. Delete failed.';
      }

    } else {
      $response->error = true;
      $response->message = 'Sorry, expense head has ledger accounts attached to it. Delete failed';
    }

  } else if (isset($_POST['update_expense_head']) && isset($_POST['title']) && isset($_POST['description'])) {
    $ExpenseHeadId = html_entity_decode(mysqli_real_escape_string($con, $_POST['update_expense_head']));
    $Title         = html_entity_decode(mysqli_real_escape_string($con, $_POST['title']));
    $Description   = html_entity_decode(mysqli_real_escape_string($con, $_POST['description']));

    if (strlen($Title) == 0 || strlen($Description) == 0 || strlen($ExpenseHeadId) == 0 || $ExpenseHeadId == null) {
      $response->error = true;
      $response->message = 'Missing params';
    } else {
      $Update = mysqli_query($con, "UPDATE cashbook_expense_heads SET name='".$Title."', description='".$Description."' WHERE id=".$ExpenseHeadId." ");
      if ($Update) {
        $response->error = false;
        $response->message = 'Success';
      } else {
        $response->error = true;
        $response->message = 'Update failed.';
      }
    }

  } else if( isset($_POST['create_ledger_account']) && isset($_POST['expense_head_id']) ) {
    $LedgerAccount = html_entity_decode(mysqli_real_escape_string($con, $_POST['create_ledger_account']));
    $ExpenseHeadId = html_entity_decode(mysqli_real_escape_string($con, $_POST['expense_head_id']));

    if (strlen($LedgerAccount) == 0 || strlen($LedgerAccount) == 0) {
      $response->error = true;
      $response->message = 'Missing params';
    } else {
      $checkLedger   = mysqli_query($con, "SELECT * FROM cashbook_ledgers WHERE ledger='".$LedgerAccount."' AND expense_head_id=".$ExpenseHeadId." ");
      if (mysqli_num_rows($checkLedger) == 0) {
        $AddLedger = mysqli_query($con, "INSERT INTO cashbook_ledgers(ledger,expense_head_id) VALUES('".$LedgerAccount."',".$ExpenseHeadId.") ");
        if ($AddLedger) {
          $response->error = false;
          $response->message = 'Success, '.$LedgerAccount.' was added';
        } else {
          $response->error = true;
          $response->message = 'Sorry, something went wrong.';
        }
      } else {
        $response->error = true;
        $response->message = 'Sorry, '.$LedgerAccount.' Already exists';
      }
    }

  } else if (isset($_POST['fetch_ledgers'])) {
    $Query = html_entity_decode(mysqli_real_escape_string($con, $_POST['fetch_ledgers']));
    $LedgerArray = array();

    if (strlen($Query) == 0 || $Query == null || $Query == 'all') {
      $Ledgers = mysqli_query($con, "SELECT cashbook_ledgers.*,cashbook_expense_heads.name AS expense_head
                FROM cashbook_ledgers INNER JOIN cashbook_expense_heads ON cashbook_ledgers.expense_head_id=cashbook_expense_heads.id
                ORDER BY cashbook_ledgers.ledger ASC ");
    } else {
      $Ledgers = mysqli_query($con, "SELECT cashbook_ledgers.*,cashbook_expense_heads.name AS expense_head
                FROM cashbook_ledgers INNER JOIN cashbook_expense_heads ON cashbook_ledgers.expense_head_id=cashbook_expense_heads.id
                WHERE cashbook_ledgers.ledger LIKE '%".$Query."%'
                OR cashbook_ledgers.id=".$Query." 
                OR cashbook_expense_heads.name LIKE '%".$Query."%'
                ORDER BY cashbook_ledgers.ledger ASC ");
    }

    

    while($Ledger  = mysqli_fetch_array($Ledgers)) {
      $LedgerEntry = new stdClass();

      $LedgerEntry->id = $Ledger[id];
      $LedgerEntry->ledger    = $Ledger[ledger];
      $LedgerEntry->expense_head = $Ledger[expense_head];
      $LedgerEntry->expense_head_id = $Ledger[expense_head_id];

      array_push($LedgerArray, $LedgerEntry);
    }

    $response->error = false;
    $response->data = $LedgerArray;

  } else if (isset($_POST['delete_expense_ledger'])) {
    $LedgerId = html_entity_decode(mysqli_real_escape_string($con, $_POST['delete_expense_ledger']));
    $Check    = mysqli_query($con, "SELECT * FROM cashbook_cash_expenses WHERE ledger_id=".$LedgerId." ");

    if (mysqli_num_rows($Check) == 0) {
      $DropLedger = mysqli_query($con, "DELETE FROM cashbook_ledgers WHERE id=".$LedgerId." LIMIT 1 ");
      if ($DropLedger) {
        $response->error = false;
        $response->message = 'Success';
      } else {
        $response->error = true;
        $response->message = 'Sorry, something went wrong';
      }
    } else {
      $response->error = true;
      $response->message = 'Sorry, ledger has expenses already';
    }

  } else if(isset($_POST['update_ledger'])) {
    $ledgerId      = html_entity_decode(mysqli_real_escape_string($con, $_POST['update_ledger']));
    $ExpenseHeadId = html_entity_decode(mysqli_real_escape_string($con, $_POST['expense_head']));
    $ledgerAcName  = html_entity_decode(mysqli_real_escape_string($con, $_POST['ledger']));

    if (strlen($ledgerId) == 0 || $ledgerId == null
        || strlen($ExpenseHeadId) == 0 || $ExpenseHeadId == null
        || strlen($ledgerAcName) == 0 || $ledgerAcName == null) 
    {
      $response->error = true;
      $response->message = 'Missing params';
    } else {
      $Update = mysqli_query($con, "UPDATE cashbook_ledgers SET ledger='".$ledgerAcName."', expense_head_id=".$ExpenseHeadId."
                WHERE cashbook_ledgers.id=".$ledgerId." ");

      if ($Update) {
        $response->error = false;
        $response->message = 'Success';
      } else {
        $response->error = true;
        $response->message = 'Something went wrong';
      }

    }

  } else if (isset($_POST['create_new_expense'])) {
    $expenseDate = html_entity_decode(mysqli_real_escape_string($con, $_POST['expense_date']));
    $expenseHead = html_entity_decode(mysqli_real_escape_string($con, $_POST['expense_head']));
    $LedgerId    = html_entity_decode(mysqli_real_escape_string($con, $_POST['ledger_id']));
    $Remarks     = html_entity_decode(mysqli_real_escape_string($con, $_POST['remarks']));
    $Amount      = html_entity_decode(mysqli_real_escape_string($con, $_POST['amount']));
    $AddedBy     = html_entity_decode(mysqli_real_escape_string($con, $_POST['added_by']));
    $Reference   = html_entity_decode(mysqli_real_escape_string($con, $_POST['reference']));

    if (strlen($expenseDate) == 0 
        || strlen($expenseHead) == 0 
        || strlen($LedgerId) == 0 || strlen($AddedBy) == 0
        || strlen($Remarks) == 0 || strlen($Amount) == 0 ) 
    {
      $response->error = true;
      $response->messagge = 'Missing Params';
    } else {
      $CheckEntry = mysqli_query($con, "SELECT * FROM cashbook_cash_expenses WHERE 
      ledger_id=".$LedgerId." AND date='".$expenseDate."' AND amount=".$Amount." ");

      if (mysqli_num_rows($CheckEntry) == 0) {
        $AddExpense = mysqli_query($con, "INSERT INTO cashbook_cash_expenses(ledger_id,date,amount,remarks,reference,added_by)
          VALUES(".$LedgerId.",'".$expenseDate."',".$Amount.",'".$Remarks."','".$Reference."',".$AddedBy.") ");

        if ($AddExpense) {
          $response->error = false;
          $response->message = 'Success';
        } else {
          $response->error = true;
          $response->message = 'Something went wrong';
        }
      } else {
        $response->error = true;
        $response->message = 'Entry Already Exists';
      }

    }


  }

  echo json_encode($response);