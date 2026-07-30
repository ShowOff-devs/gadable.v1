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
        Schema::create('subscription_plan_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subscription_plan_id')->constrained()->restrictOnDelete();
            $table->unsignedInteger('version_number');
            $table->string('status')->default('draft');
            $table->string('currency', 3)->default('PHP');
            $table->decimal('implementation_amount', 18, 2)->nullable();
            $table->decimal('recurring_amount', 18, 2)->nullable();
            $table->string('billing_cycle')->nullable();
            $table->boolean('vat_inclusive')->nullable();
            $table->json('entitlements');
            $table->date('effective_from')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamp('retired_at')->nullable();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('published_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['subscription_plan_id', 'version_number']);
            $table->index(['status', 'effective_from']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_plan_versions');
    }
};
