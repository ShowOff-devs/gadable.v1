<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('paps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('reference');
            $table->string('title');
            $table->unsignedSmallInteger('fiscal_year');
            $table->string('pap_type')->nullable();
            $table->string('implementing_unit')->nullable();
            $table->string('gad_sector')->nullable();
            $table->string('funding_source')->nullable();
            $table->string('workflow_status');
            $table->decimal('requested_amount', 18, 2)->nullable();
            $table->decimal('total_pap_cost', 18, 2)->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['organization_id', 'reference']);
            $table->index(['organization_id', 'fiscal_year', 'workflow_status']);
        });

        Schema::create('pap_decisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('pap_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('status');
            $table->date('decision_date');
            $table->string('decision_reference')->nullable();
            $table->text('basis')->nullable();
            $table->json('conditions')->nullable();
            $table->date('conditions_due_on')->nullable();
            $table->string('conditions_status')->nullable();
            $table->foreignId('approver_id')->constrained('users')->restrictOnDelete();
            $table->timestamps();
            $table->index(['organization_id', 'status', 'decision_date']);
        });

        Schema::create('pap_financial_summaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('pap_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('pap_decision_id')->unique()->constrained()->restrictOnDelete();
            $table->unsignedSmallInteger('fiscal_year');
            $table->char('currency', 3)->default('PHP');
            $table->decimal('total_pap_cost', 18, 2)->nullable();
            $table->decimal('requested_amount', 18, 2)->nullable();
            $table->decimal('recommended_amount', 18, 2)->nullable();
            $table->decimal('approved_amount', 18, 2)->nullable();
            $table->string('gad_classification');
            $table->string('attribution_method');
            $table->decimal('attribution_percentage', 7, 4)->nullable();
            $table->decimal('attribution_base_amount', 18, 2)->nullable();
            $table->decimal('gad_attributed_amount', 18, 2)->nullable();
            $table->text('attribution_basis')->nullable();
            $table->string('funding_source')->nullable();
            $table->text('funding_details')->nullable();
            $table->date('approval_date');
            $table->string('financial_status');
            $table->string('official_reference')->nullable();
            $table->text('remarks')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->unsignedInteger('lock_version')->default(1);
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('updated_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();
            $table->index(['organization_id', 'fiscal_year', 'financial_status']);
        });

        Schema::create('organization_budget_baselines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('fiscal_year');
            $table->char('currency', 3)->default('PHP');
            $table->decimal('total_annual_budget', 18, 2)->nullable();
            $table->decimal('approved_gad_budget', 18, 2)->nullable();
            $table->string('source_reference')->nullable();
            $table->date('approval_date')->nullable();
            $table->text('remarks')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->unsignedInteger('lock_version')->default(1);
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('updated_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();
            $table->unique(['organization_id', 'fiscal_year']);
        });

        Schema::create('financial_amendments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('pap_financial_summary_id')->constrained()->restrictOnDelete();
            $table->json('previous_values');
            $table->json('new_values');
            $table->text('reason');
            $table->string('authority_reference');
            $table->date('effective_date');
            $table->boolean('attested')->default(false);
            $table->unsignedInteger('prior_lock_version');
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();
            $table->index(['organization_id', 'pap_financial_summary_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financial_amendments');
        Schema::dropIfExists('organization_budget_baselines');
        Schema::dropIfExists('pap_financial_summaries');
        Schema::dropIfExists('pap_decisions');
        Schema::dropIfExists('paps');
    }
};
