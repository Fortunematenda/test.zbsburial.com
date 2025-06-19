<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\ServicesModel;
use App\Models\ContactedLeadsModel;
use App\Models\UserServicesModel;
use App\Models\LeadsModel;
use App\Models\ServiceQuestionModel;
use App\Models\ServicePossibleAnswerModel;
use App\Http\Controllers\ProfileController; 
use Illuminate\Support\Facades\DB;
use App\Models\ServicePossibleAnswer;
use App\Models\ServiceQuestion;
use Illuminate\Http\RedirectResponse;


class ServiceQuestionController extends Controller
{
    public function index()
    {
        $questions = ServiceQuestion::all();
        return view('service_questions.index', compact('questions'));
    }

    public function create()
    {
        return view('service_questions.create');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'question' => 'required|string|max:255',
        ]);

        ServiceQuestion::create([
            'question' => $request->question,
            'date_entered' => now(),
            'entered_by' => 'system', 
            'status' => 1, 
        ]);

        return redirect()->route('service_questions.index')->with('success', 'Service question created successfully.');
    }

    public function edit(int $id)
    {
        $question = ServiceQuestion::findOrFail($id);
        return view('service_questions.edit', compact('question'));
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'question' => 'required|string|max:255',
        ]);

        $question = ServiceQuestion::findOrFail($id);
        $question->update([
            'question' => $request->question,
        ]);

        return redirect()->route('service_questions.index')->with('success', 'Service question updated successfully.');
    }

    public function destroy(int $id): RedirectResponse
    {
        $question = ServiceQuestion::findOrFail($id);
        $question->delete();

        return redirect()->route('service_questions.index')->with('success', 'Service question deleted successfully.');
    }
}
